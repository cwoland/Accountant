import { Types } from 'mongoose';
import type { RequestHandler } from 'express';
import { createTransferBody, type TransferDto } from '@accountant/shared';
import { Transaction } from '../models/Transaction.js';
import { Category } from '../models/Category.js';
import { requireAccountAccess } from '../lib/accountAccess.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badRequest } from '../lib/HttpError.js';
import type { IdHandler } from '../types/handlers.js';

async function transferCategory(): Promise<Types.ObjectId> {
  const doc = await Category.findOneAndUpdate(
    { isSystem: true, name: 'Перевод' },
    {
      $setOnInsert: {
        user: null, type: 'both', icon: 'arrow-left-right',
        ink: 10, isMandatory: false, isSystem: true, hiddenFor: [], archivedAt: null,
      },
    },
    { upsert: true, new: true },
  ).lean();
  return doc!._id;
}

export const createTransfer: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof createTransferBody>(req, 'body');
    const me = currentUser(req);

    const resolve = async (id: string | null) =>
      id ? (await requireAccountAccess(id, me._id)).account._id : null;

    const [from, to] = await Promise.all([
      resolve(body.fromAccountId),
      resolve(body.toAccountId),
    ]);
    if (String(from) === String(to)) {
      throw badRequest('Счета перевода должны различаться', { toAccountId: 'Тот же счёт' });
    }

    const category = await transferCategory();
    const transferId = new Types.ObjectId();
    const common = {
      user: me._id,
      category,
      amount: body.amount,
      date: body.date,
      description: body.note,
      transfer: transferId,
      isRecurring: false,
      recurringPeriod: null,
    };

    const created = await Transaction.insertMany(
      [
        { ...common, account: from, type: 'expense' },
        { ...common, account: to, type: 'income' },
      ],
      { ordered: true },
    );

    const out = created[0];
    const incoming = created[1];
    if (!out || !incoming) throw badRequest('Не удалось создать перевод.');

    const payload: TransferDto = {
      transferId: transferId.toString(),
      from: out._id.toString(),
      to: incoming._id.toString(),
    };
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
};

export const deleteTransfer: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const result = await Transaction.deleteMany({
      transfer: new Types.ObjectId(req.params.id),
      user: me._id,
    });
    if (result.deletedCount === 0) throw badRequest('Перевод не найден');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};