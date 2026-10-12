import type { RequestHandler } from 'express';
import { z } from 'zod';
import { asMinor, objectId, toIconName, type PendingItemDto } from '@accountant/shared';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { Debt } from '../models/Debt.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { requireAccountAccess } from '../lib/accountAccess.js';
import { currentMonth, monthRange } from '../lib/dates.js';

export const pendingQuery = z.object({ accountId: objectId.optional() });

export const getPending: RequestHandler = async (req, res, next) => {
  try {
    const { accountId } = valid<typeof pendingQuery>(req, 'query');
    const me = currentUser(req);

    const scope = accountId
      ? { account: (await requireAccountAccess(accountId, me._id)).account._id }
      : { user: me._id, account: null };

    const { year, month } = currentMonth();
    const { start, end } = monthRange(year, month);

    const [mandatory, paidIds, debts] = await Promise.all([
      Category.find({ isSystem: true, isMandatory: true, archivedAt: null, hiddenFor: { $ne: me._id } })
        .select('_id name icon ink dueDay')
        .lean(),
      Transaction.distinct('category', { ...scope, type: 'expense', date: { $gte: start, $lt: end } }),
      Debt.find({ user: me._id, settledAt: null, dueDate: { $ne: null } })
        .select('_id name totalAmount paidAmount dueDate')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),
    ]);

    const paid = new Set(paidIds.map(String));
    const items: PendingItemDto[] = [];

    for (const c of mandatory) {
      if (paid.has(String(c._id))) continue;
      const due = c.dueDay
        ? new Date(Date.UTC(year, month - 1, Math.min(c.dueDay, 28), -3)).toISOString()
        : null;
      items.push({
        kind: 'mandatory',
        id: c._id.toString(),
        title: c.name,
        icon: toIconName(c.icon),
        subtitle: 'не оплачено в этом месяце',
        amount: null,
        ink: c.ink,
        dueDate: due,
        url: '/mandatory',
      });
    }

    for (const d of debts) {
      items.push({
        kind: 'debt',
        id: d._id.toString(),
        title: d.name,
        icon: 'landmark',
        subtitle: 'платёж по долгу',
        amount: asMinor(d.totalAmount - d.paidAmount),
        ink: 11,
        dueDate: d.dueDate ? d.dueDate.toISOString() : null,
        url: '/debts',
      });
    }

    items.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    res.json(items.slice(0, 8));
  } catch (err) {
    next(err);
  }
};