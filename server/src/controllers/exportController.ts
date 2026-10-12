import type { RequestHandler } from 'express';
import { exportQuery } from '@accountant/shared';
import { Transaction } from '../models/Transaction.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { requireAccountAccess } from '../lib/accountAccess.js';

const RISKY_PREFIX = /^[=+\-@\t\r]/;

function csvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const guarded = RISKY_PREFIX.test(raw) ? `'${raw}` : raw;
  return /["\n\r;,]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

export const exportCsv: RequestHandler = async (req, res, next) => {
  try {
    const q = valid<typeof exportQuery>(req, 'query');
    const me = currentUser(req);

    const scope = q.accountId
      ? { account: (await requireAccountAccess(q.accountId, me._id)).account._id }
      : { user: me._id, account: null };

    const filter: Record<string, unknown> = { ...scope };
    if (q.startDate || q.endDate) {
      filter.date = {
        ...(q.startDate ? { $gte: q.startDate } : {}),
        ...(q.endDate ? { $lte: q.endDate } : {}),
      };
    }

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="accountant-${stamp}.csv"`);
    res.setHeader('Cache-Control', 'no-store');
    res.write('﻿');

    const d = q.delimiter;
    res.write(
      ['Дата', 'Тип', 'Категория', 'Описание', 'Сумма', 'Валюта', 'Теги', 'Повтор'].join(d) + '\r\n',
    );

    const cursor = Transaction.find(filter)
      .populate('category', 'name')
      .sort({ date: 1, _id: 1 })
      .lean()
      .cursor();

    for await (const tx of cursor) {
      const category = tx.category as unknown as { name?: string } | null;
      res.write(
        [
          csvCell(tx.date.toISOString().slice(0, 10)),
          csvCell(tx.transfer ? 'Перевод' : tx.type === 'income' ? 'Доход' : 'Расход'),
          csvCell(category?.name ?? ''),
          csvCell(tx.description),
          csvCell((tx.amount / 100).toFixed(2)),
          csvCell(me.currency),
          csvCell(tx.tags.join(' ')),
          csvCell(tx.recurringPeriod ?? ''),
        ].join(d) + '\r\n',
      );
    }

    res.end();
  } catch (err) {
    next(err);
  }
};
