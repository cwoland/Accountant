import type { RequestHandler } from 'express';
import type { IdHandler } from '../types/handlers.js';
import { asMinor, contributionBody, createDebtBody, type DebtDto } from '@accountant/shared';
import { Debt, type IDebt } from '../models/Debt.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badRequest, notFound } from '../lib/HttpError.js';

function toDto(d: IDebt): DebtDto {
  return {
    _id: d._id.toString(),
    name: d.name,
    totalAmount: asMinor(d.totalAmount),
    paidAmount: asMinor(d.paidAmount),
    remaining: asMinor(Math.max(0, d.totalAmount - d.paidAmount)),
    currency: d.currency,
    dueDate: d.dueDate ? d.dueDate.toISOString() : null,
    isOwed: d.isOwed,
    creditor: d.creditor,
    note: d.note,
    settled: d.settledAt !== null,
    payments: d.payments.map((p) => ({
      amount: asMinor(p.amount),
      date: p.date.toISOString(),
      note: p.note,
    })),
    createdAt: d.createdAt.toISOString(),
  };
}

export const getDebts: RequestHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const rows = await Debt.find({ user: me._id })
      .sort({ settledAt: 1, dueDate: 1, createdAt: -1 })
      .lean();
    res.json(rows.map(toDto));
  } catch (err) {
    next(err);
  }
};

export const createDebt: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof createDebtBody>(req, 'body');
    const me = currentUser(req);
    const doc = await Debt.create({
      ...body,
      user: me._id,
      currency: body.currency ?? me.currency,
    });
    res.status(201).json(toDto(doc.toObject()));
  } catch (err) {
    next(err);
  }
};

export const addPayment: IdHandler = async (req, res, next) => {
  try {
    const { amount, note } = valid<typeof contributionBody>(req, 'body');
    const me = currentUser(req);

    const debt = await Debt.findOne({ _id: req.params.id, user: me._id }).lean();
    if (!debt) throw notFound('Долг не найден.');

    const remaining = debt.totalAmount - debt.paidAmount;
    if (amount > remaining) {
      throw badRequest(`Остаток долга меньше платежа — осталось ${remaining / 100}`, {
        amount: 'Больше остатка',
      });
    }

    const willSettle = debt.paidAmount + amount >= debt.totalAmount;
    const updated = await Debt.findOneAndUpdate(
      { _id: debt._id, user: me._id, paidAmount: debt.paidAmount },
      {
        $push: { payments: { amount, note: note ?? '', date: new Date() } },
        $inc: { paidAmount: amount },
        ...(willSettle ? { $set: { settledAt: new Date() } } : {}),
      },
      { new: true },
    ).lean();

    if (!updated) throw badRequest('Долг изменился — обновите страницу и повторите.');

    res.json(toDto(updated));
  } catch (err) {
    next(err);
  }
};

export const deleteDebt: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const result = await Debt.deleteOne({ _id: req.params.id, user: me._id });
    if (result.deletedCount === 0) throw notFound('Долг не найден.');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};