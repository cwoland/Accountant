import type { RequestHandler } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { pushToUser } from '../services/pushService.js';
import { formatMoney, asMinor } from '@accountant/shared';
import { currentMonth, dayOfMonth, monthRange, previousMonth } from '../lib/dates.js';
import { logger } from '../lib/logger.js';

export const subscribeBody = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
  }),
});

export const subscribe: RequestHandler = async (req, res, next) => {
  try {
    const { subscription } = valid<typeof subscribeBody>(req, 'body');
    const me = currentUser(req);

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          user: me._id,
          keys: subscription.keys,
          userAgent: req.get('user-agent')?.slice(0, 300) ?? '',
          lastSeenAt: new Date(),
        },
      },
      { upsert: true },
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const unsubscribe: RequestHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const endpoint = typeof req.body?.endpoint === 'string' ? req.body.endpoint : null;
    await PushSubscription.deleteMany(
      endpoint ? { user: me._id, endpoint } : { user: me._id },
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getVapidKey: RequestHandler = (_req, res) => {
  res.json({ publicKey: env.VAPID_PUBLIC_KEY });
};

export const notifyMandatory: RequestHandler = async (_req, res, next) => {
  try {
    const { year, month } = currentMonth();
    const { start, end } = monthRange(year, month);
    const today = dayOfMonth();

    const mandatory = await Category.find({
      isSystem: true,
      isMandatory: true,
      archivedAt: null,
    })
      .select('_id name dueDay hiddenFor')
      .lean();
    if (mandatory.length === 0) {
      res.json({ notified: 0 });
      return;
    }

    const userIds = await PushSubscription.distinct('user');
    let notified = 0;

    for (const userId of userIds) {
      const paid = new Set(
        (
          await Transaction.distinct('category', {
            user: userId,
            type: 'expense',
            account: null,
            date: { $gte: start, $lt: end },
          })
        ).map(String),
      );

      const due = mandatory.filter(
        (c) =>
          !paid.has(String(c._id)) &&
          !c.hiddenFor.some((id) => id.equals(userId)) &&
          (c.dueDay === null || c.dueDay - today <= 3),
      );
      if (due.length === 0) continue;

      const names = due.slice(0, 3).map((c) => c.name).join(', ');
      const more = due.length > 3 ? ` и ещё ${due.length - 3}` : '';
      const sent = await pushToUser(userId, {
        title: 'Обязательные платежи',
        body: `Не оплачено: ${names}${more}`,
        url: '/mandatory',
        tag: `mandatory-${year}-${month}`,
      });
      if (sent > 0) notified += 1;
    }

    logger.info({ notified }, 'cron: напоминание об обязательных');
    res.json({ notified });
  } catch (err) {
    next(err);
  }
};

export const notifyMonthlyStats: RequestHandler = async (_req, res, next) => {
  try {
    const { year, month } = previousMonth();
    const { start, end } = monthRange(year, month);

    const userIds = await PushSubscription.distinct('user');
    if (userIds.length === 0) {
      res.json({ notified: 0 });
      return;
    }

    const rows = await Transaction.aggregate<{
      _id: { user: unknown; type: 'income' | 'expense' };
      total: number;
    }>([
      { $match: { user: { $in: userIds }, account: null, date: { $gte: start, $lt: end } } },
      { $group: { _id: { user: '$user', type: '$type' }, total: { $sum: '$amount' } } },
    ]);

    const byUser = new Map<string, { income: number; expense: number }>();
    for (const row of rows) {
      const key = String(row._id.user);
      const entry = byUser.get(key) ?? { income: 0, expense: 0 };
      entry[row._id.type] = row.total;
      byUser.set(key, entry);
    }

    const users = await User.find({ _id: { $in: userIds } }).select('currency').lean();
    const currencyOf = new Map(users.map((u) => [u._id.toString(), u.currency]));

    let notified = 0;
    for (const userId of userIds) {
      const totals = byUser.get(String(userId));
      if (!totals || (totals.income === 0 && totals.expense === 0)) continue;

      const cur = currencyOf.get(String(userId)) ?? 'RUB';
      const balance = totals.income - totals.expense;
      const sent = await pushToUser(userId, {
        title: 'Итоги месяца',
        body:
          `Доходы ${formatMoney(asMinor(totals.income), cur)} · ` +
          `Расходы ${formatMoney(asMinor(totals.expense), cur)} · ` +
          `Баланс ${formatMoney(asMinor(balance), cur, { sign: true })}`,
        url: '/',
        tag: `monthly-${year}-${month}`,
      });
      if (sent > 0) notified += 1;
    }

    logger.info({ notified, year, month }, 'cron: итоги месяца');
    res.json({ notified });
  } catch (err) {
    next(err);
  }
};