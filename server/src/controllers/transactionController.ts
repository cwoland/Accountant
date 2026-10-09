import { Types } from 'mongoose';
import type { RequestHandler } from 'express';
import type { IdHandler } from '../types/handlers.js';
import {
  createTransactionBody,
  listTransactionsQuery,
  statsQuery,
  updateTransactionBody,
  type Paginated,
  type TransactionDto,
} from '@accountant/shared';
import { Transaction } from '../models/Transaction.js';
import { Category } from '../models/Category.js';
import { requireAccountAccess } from '../lib/accountAccess.js';
import { computeStats } from '../services/statsService.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badRequest, forbidden, notFound } from '../lib/HttpError.js';
import { toTransactionDto } from '../lib/serializers.js';

type Scope = { user: Types.ObjectId; account: null } | { account: Types.ObjectId };

async function resolveScope(
  req: Express.Request,
  accountId: string | undefined,
): Promise<Scope> {
  const me = currentUser(req);
  if (!accountId) return { user: me._id, account: null };
  const { account } = await requireAccountAccess(accountId, me._id);
  return { account: account._id };
}

export const getTransactions: RequestHandler = async (req, res, next) => {
  try {
    const q = valid<typeof listTransactionsQuery>(req, 'query');
    const scope = await resolveScope(req, q.accountId);

    const filter: Record<string, unknown> = { ...scope };
    if (q.type) filter.type = q.type;
    if (q.category) filter.category = new Types.ObjectId(q.category);
    if (q.startDate || q.endDate) {
      filter.date = {
        ...(q.startDate ? { $gte: q.startDate } : {}),
        ...(q.endDate ? { $lte: q.endDate } : {}),
      };
    }
    if (q.search) filter.$text = { $search: q.search };

    const skip = (q.page - 1) * q.limit;

    const [items, total] = await Promise.all([
      Transaction.find(filter)
        .populate('category', 'name icon ink isMandatory type')
        .sort({ [q.sortBy]: q.order === 'desc' ? -1 : 1, _id: -1 })
        .skip(skip)
        .limit(q.limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const payload: Paginated<TransactionDto> = {
      items: items.map(toTransactionDto),
      page: q.page,
      pages: Math.max(1, Math.ceil(total / q.limit)),
      limit: q.limit,
      total,
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const getStats: RequestHandler = async (req, res, next) => {
  try {
    const q = valid<typeof statsQuery>(req, 'query');
    const scope = await resolveScope(req, q.accountId);
    const range: { start?: Date; end?: Date } = {};
    if (q.startDate) range.start = q.startDate;
    if (q.endDate) range.end = q.endDate;

    res.json(await computeStats(scope, range));
  } catch (err) {
    next(err);
  }
};

export const createTransaction: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof createTransactionBody>(req, 'body');
    const me = currentUser(req);

    let accountId: Types.ObjectId | null = null;
    if (body.accountId) {
      const { account } = await requireAccountAccess(body.accountId, me._id);
      accountId = account._id;
    }

    const category = await Category.findOne({
      _id: body.category,
      archivedAt: null,
      $or: [{ user: me._id }, { isSystem: true }],
    }).lean();
    if (!category) throw badRequest('Категория не найдена', { category: 'Выберите категорию' });

    const doc = await Transaction.create({
      user: me._id,
      account: accountId,
      type: body.type,
      amount: body.amount,
      category: category._id,
      description: body.description,
      date: body.date,
      isRecurring: body.isRecurring,
      recurringPeriod: body.isRecurring ? (body.recurringPeriod ?? 'monthly') : null,
      tags: body.tags,
    });

    await doc.populate('category', 'name icon ink isMandatory type');
    res.status(201).json(toTransactionDto(doc.toObject()));
  } catch (err) {
    next(err);
  }
};

export const updateTransaction: IdHandler = async (req, res, next) => {
  try {
    const body = valid<typeof updateTransactionBody>(req, 'body');
    const me = currentUser(req);

    const doc = await Transaction.findById(req.params.id);
    if (!doc) throw notFound('Транзакция не найдена.');
    if (!doc.user.equals(me._id)) throw forbidden('Можно менять только свои записи.');

    if (body.type !== undefined) doc.type = body.type;
    if (body.amount !== undefined) doc.amount = body.amount;
    if (body.category !== undefined) doc.category = new Types.ObjectId(body.category);
    if (body.description !== undefined) doc.description = body.description;
    if (body.date !== undefined) doc.date = body.date;
    if (body.tags !== undefined) doc.tags = body.tags;
    if (body.isRecurring !== undefined) {
      doc.isRecurring = body.isRecurring;
      doc.recurringPeriod = body.isRecurring
        ? (body.recurringPeriod ?? doc.recurringPeriod ?? 'monthly')
        : null;
    }

    await doc.save();
    await doc.populate('category', 'name icon ink isMandatory type');
    res.json(toTransactionDto(doc.toObject()));
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const result = await Transaction.deleteOne({ _id: req.params.id, user: me._id });
    if (result.deletedCount === 0) throw notFound('Транзакция не найдена.');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};