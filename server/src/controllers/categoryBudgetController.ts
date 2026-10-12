import type { RequestHandler } from 'express';
import { asMinor, categoryBudgetQuery, setCategoryBudgetsBody, type CategoryBudgetDto } from '@accountant/shared';
import { CategoryBudget } from '../models/CategoryBudget.js';
import { Transaction } from '../models/Transaction.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { monthRange } from '../lib/dates.js';

export const getCategoryBudgets: RequestHandler = async (req, res, next) => {
  try {
    const { year, month } = valid<typeof categoryBudgetQuery>(req, 'query');
    const me = currentUser(req);
    const { start, end } = monthRange(year, month);

    const [limits, spent] = await Promise.all([
      CategoryBudget.find({ user: me._id, year, month }).lean(),
      Transaction.aggregate<{ _id: unknown; total: number }>([
        {
          $match: {
            user: me._id, account: null, type: 'expense',
            transfer: null, date: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
    ]);

    const spentBy = new Map(spent.map((s) => [String(s._id), s.total]));

    const payload: CategoryBudgetDto[] = limits.map((l) => ({
      category: l.category.toString(),
      amount: asMinor(l.amount),
      spent: asMinor(spentBy.get(l.category.toString()) ?? 0),
    }));
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const setCategoryBudgets: RequestHandler = async (req, res, next) => {
  try {
    const { year, month, items } = valid<typeof setCategoryBudgetsBody>(req, 'body');
    const me = currentUser(req);

    const toRemove = items.filter((i) => i.amount === 0).map((i) => i.category);
    const toSet = items.filter((i) => i.amount > 0);

    const ops = [
      ...(toRemove.length
        ? [{ deleteMany: { filter: { user: me._id, year, month, category: { $in: toRemove } } } }]
        : []),
      ...toSet.map((i) => ({
        updateOne: {
          filter: { user: me._id, year, month, category: i.category },
          update: { $set: { amount: i.amount } },
          upsert: true,
        },
      })),
    ];

    if (ops.length > 0) await CategoryBudget.bulkWrite(ops as never);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};