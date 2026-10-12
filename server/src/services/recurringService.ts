import { Types } from 'mongoose';
import { nextOccurrence, type RecurringPeriod } from '@accountant/shared';
import { Transaction } from '../models/Transaction.js';
import { logger } from '../lib/logger.js';

const MAX_CATCHUP_PER_RULE = 24;

export interface MaterializeResult {
  rules: number;
  created: number;
  skipped: number;
}

export async function materializeDue(now = new Date()): Promise<MaterializeResult> {
  const due = await Transaction.find({
    isRecurring: true,
    recurringStoppedAt: null,
    nextRunAt: { $ne: null, $lte: now },
  }).limit(500);

  let created = 0;
  let skipped = 0;

  for (const rule of due) {
    const period = rule.recurringPeriod as RecurringPeriod | null;
    if (!period) {
      rule.nextRunAt = null;
      await rule.save();
      skipped += 1;
      continue;
    }

    let cursor = rule.nextRunAt ?? now;
    let made = 0;

    while (cursor <= now && made < MAX_CATCHUP_PER_RULE) {
      const claimed = await Transaction.findOneAndUpdate(
        { _id: rule._id, nextRunAt: cursor },
        { $set: { nextRunAt: nextOccurrence(cursor, period, rule.recurringAnchorDay ?? undefined) } },
        { new: true },
      );
      if (!claimed) break;

      await Transaction.create({
        user: rule.user,
        account: rule.account,
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        description: rule.description,
        date: cursor,
        tags: rule.tags,
        isRecurring: false,
        recurringPeriod: null,
        recurringParent: rule._id,
        split: rule.split,
      });

      created += 1;
      made += 1;
      cursor = claimed.nextRunAt ?? now;
    }

    if (made >= MAX_CATCHUP_PER_RULE) {
      logger.warn({ ruleId: rule._id, made }, 'recurring: упёрлись в предохранитель');
    }
  }

  return { rules: due.length, created, skipped };
}

export function recurrenceFields(input: {
  isRecurring: boolean;
  period: RecurringPeriod | null;
  date: Date;
}): Pick<
  { nextRunAt: Date | null; recurringAnchorDay: number | null; recurringPeriod: RecurringPeriod | null },
  'nextRunAt' | 'recurringAnchorDay' | 'recurringPeriod'
> {
  if (!input.isRecurring || !input.period) {
    return { nextRunAt: null, recurringAnchorDay: null, recurringPeriod: null };
  }
  return {
    recurringPeriod: input.period,
    recurringAnchorDay: input.date.getUTCDate(),
    nextRunAt: nextOccurrence(input.date, input.period, input.date.getUTCDate()),
  };
}

export async function stopSeries(ruleId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
  const res = await Transaction.updateOne(
    { _id: ruleId, user: userId, isRecurring: true },
    { $set: { recurringStoppedAt: new Date(), nextRunAt: null } },
  );
  return res.modifiedCount > 0;
}