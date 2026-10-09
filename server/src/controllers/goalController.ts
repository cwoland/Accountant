import type { RequestHandler } from 'express';
import type { IdHandler } from '../types/handlers.js';
import { asMinor, contributionBody, createGoalBodyV2, toIconName, type GoalDto } from '@accountant/shared';
import { Goal, type IGoal } from '../models/Goal.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badRequest, notFound } from '../lib/HttpError.js';
import { pushToUser } from '../services/pushService.js';

function toDto(g: IGoal): GoalDto {
  return {
    _id: g._id.toString(),
    name: g.name,
    targetAmount: asMinor(g.targetAmount),
    currentAmount: asMinor(g.currentAmount),
    remaining: asMinor(Math.max(0, g.targetAmount - g.currentAmount)),
    currency: g.currency,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    icon: toIconName(g.icon, 'target'),
    ink: g.ink,
    note: g.note,
    completed: g.completedAt !== null,
    contributions: g.contributions.map((c) => ({
      amount: asMinor(c.amount),
      date: c.date.toISOString(),
      note: c.note,
    })),
    createdAt: g.createdAt.toISOString(),
  };
}

export const getGoals: RequestHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const rows = await Goal.find({ user: me._id })
      .sort({ completedAt: 1, deadline: 1, createdAt: -1 })
      .lean();
    res.json(rows.map(toDto));
  } catch (err) {
    next(err);
  }
};

export const createGoal: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof createGoalBodyV2>(req, 'body');
    const me = currentUser(req);
    const doc = await Goal.create({
      ...body,
      user: me._id,
      currency: body.currency ?? me.currency,
    });
    res.status(201).json(toDto(doc.toObject()));
  } catch (err) {
    next(err);
  }
};

export const contribute: IdHandler = async (req, res, next) => {
  try {
    const { amount, note } = valid<typeof contributionBody>(req, 'body');
    const me = currentUser(req);

    const goal = await Goal.findOne({ _id: req.params.id, user: me._id }).lean();
    if (!goal) throw notFound('Цель не найдена.');
    if (goal.completedAt) throw badRequest('Цель уже достигнута.');

    const justCompleted = goal.currentAmount + amount >= goal.targetAmount;

    const updated = await Goal.findOneAndUpdate(
      { _id: goal._id, user: me._id, currentAmount: goal.currentAmount },
      {
        $push: { contributions: { amount, note: note ?? '', date: new Date() } },
        $inc: { currentAmount: amount },
        ...(justCompleted ? { $set: { completedAt: new Date() } } : {}),
      },
      { new: true },
    ).lean();

    if (!updated) throw badRequest('Цель изменилась — обновите страницу и повторите.');

    res.json(toDto(updated));

    if (justCompleted) {
      void pushToUser(me._id, {
        title: 'Цель достигнута',
        body: `Вы накопили на «${updated.name}»`,
        url: '/goals',
        tag: `goal-${updated._id.toString()}`,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteGoal: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const result = await Goal.deleteOne({ _id: req.params.id, user: me._id });
    if (result.deletedCount === 0) throw notFound('Цель не найдена.');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};