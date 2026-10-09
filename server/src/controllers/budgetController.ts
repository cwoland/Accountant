import type { RequestHandler } from 'express';
import { asMinor, budgetQuery, setBudgetBody, type BudgetDto } from '@accountant/shared';
import { MonthlyBudget } from '../models/MonthlyBudget.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';

export const getBudget: RequestHandler = async (req, res, next) => {
  try {
    const { year, month } = valid<typeof budgetQuery>(req, 'query');
    const me = currentUser(req);

    const explicit = await MonthlyBudget.findOne({ user: me._id, year, month }).lean();

    const payload: BudgetDto = explicit
      ? { year, month, amount: asMinor(explicit.amount), isDefault: false }
      : { year, month, amount: asMinor(me.monthlyBudget), isDefault: true };

    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const setBudget: RequestHandler = async (req, res, next) => {
  try {
    const { year, month, amount } = valid<typeof setBudgetBody>(req, 'body');
    const me = currentUser(req);

    const doc = await MonthlyBudget.findOneAndUpdate(
      { user: me._id, year, month },
      { $set: { amount } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    const payload: BudgetDto = {
      year,
      month,
      amount: asMinor(doc?.amount ?? amount),
      isDefault: false,
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
};