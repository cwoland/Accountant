import { Types } from 'mongoose';
import { asMinor, splitBody, type SettlementDto } from '@accountant/shared';
import { Transaction } from '../models/Transaction.js';
import { requireAccountAccess, participantIds } from '../lib/accountAccess.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badRequest, notFound } from '../lib/HttpError.js';
import type { IdHandler, AccountIdHandler } from '../types/handlers.js';

export function equalShares(amount: number, userIds: string[]): { user: string; share: number }[] {
  if (userIds.length === 0) return [];
  const base = Math.floor(amount / userIds.length);
  let rest = amount - base * userIds.length;
  return userIds.map((user) => {
    const extra = rest > 0 ? 1 : 0;
    rest -= extra;
    return { user, share: base + extra };
  });
}

export const setSplit: IdHandler = async (req, res, next) => {
  try {
    const { shares } = valid<typeof splitBody>(req, 'body');
    const me = currentUser(req);

    const tx = await Transaction.findById(req.params.id);
    if (!tx) throw notFound('Операция не найдена.');
    if (!tx.user.equals(me._id)) throw badRequest('Делить можно только свои записи.');
    if (!tx.account) throw badRequest('Делить можно только траты совместного счёта.');
    if (tx.transfer) throw badRequest('Перевод нельзя разделить.');

    const { account } = await requireAccountAccess(tx.account, me._id);
    const allowed = new Set(participantIds(account).map(String));
    const unknown = shares.find((s) => !allowed.has(s.user));
    if (unknown) throw badRequest('В долях есть участник вне этого счёта.');

    const seen = new Set<string>();
    for (const s of shares) {
      if (seen.has(s.user)) throw badRequest('Участник указан дважды.');
      seen.add(s.user);
    }

    const total = shares.reduce((sum, s) => sum + s.share, 0);
    if (total !== tx.amount) {
      throw badRequest('Сумма долей не сходится с суммой операции.', {
        shares: `Доли дают ${(total / 100).toFixed(2)}, а операция ${(tx.amount / 100).toFixed(2)}`,
      });
    }

    tx.split = shares.map((s) => ({ user: new Types.ObjectId(s.user), share: s.share }));
    await tx.save();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const clearSplit: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const result = await Transaction.updateOne(
      { _id: req.params.id, user: me._id },
      { $set: { split: [] } },
    );
    if (result.matchedCount === 0) throw notFound('Операция не найдена.');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getSettlement: AccountIdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const { account } = await requireAccountAccess(req.params.accountId, me._id);

    const rows = await Transaction.find({
      account: account._id,
      type: 'expense',
      transfer: null,
      'split.0': { $exists: true },
    })
      .select('user amount split')
      .lean();

    const net = new Map<string, number>();
    for (const id of participantIds(account)) net.set(id.toString(), 0);

    for (const tx of rows) {
      const payer = tx.user.toString();
      if (net.has(payer)) net.set(payer, (net.get(payer) ?? 0) + tx.amount);
      for (const s of tx.split) {
        const u = s.user.toString();
        if (net.has(u)) net.set(u, (net.get(u) ?? 0) - s.share);
      }
    }

    const creditors = [...net.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const debtors = [...net.entries()].filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]);

    const debts: SettlementDto['debts'] = [];
    let ci = 0;
    let di = 0;

    while (ci < creditors.length && di < debtors.length) {
      const credit = creditors[ci];
      const debt = debtors[di];
      if (!credit || !debt) break;

      const move = Math.min(credit[1], -debt[1]);
      if (move > 0) debts.push({ from: debt[0], to: credit[0], amount: asMinor(move) });

      creditors[ci] = [credit[0], credit[1] - move];
      debtors[di] = [debt[0], debt[1] + move];
      if ((creditors[ci]?.[1] ?? 0) === 0) ci += 1;
      if ((debtors[di]?.[1] ?? 0) === 0) di += 1;
    }

    const payload: SettlementDto = {
      balances: [...net.entries()].map(([user, amount]) => ({ user, amount: asMinor(amount) })),
      debts,
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
};
