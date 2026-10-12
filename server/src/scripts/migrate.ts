import mongoose from 'mongoose';
import {
  EMOJI_TO_ICON,
  ICON_NAMES,
  nextOccurrence,
  type RecurringPeriod,
} from '@accountant/shared';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../lib/logger.js';

const steps: { id: string; run: () => Promise<string> }[] = [
  {
    id: '001-account-null',
    async run() {
      const r = await mongoose.connection
        .collection('transactions')
        .updateMany({ account: { $exists: false } }, { $set: { account: null } });
      return `transactions.account=null: ${r.modifiedCount}`;
    },
  },
  {
    id: '002-money-to-minor',
    async run() {
      const db = mongoose.connection;
      const out: string[] = [];

      const specs = [
        { coll: 'transactions', fields: ['amount'] },
        { coll: 'monthlybudgets', fields: ['amount'] },
        { coll: 'users', fields: ['monthlyBudget'] },
        { coll: 'debts', fields: ['totalAmount', 'paidAmount'] },
        { coll: 'goals', fields: ['targetAmount', 'currentAmount'] },
      ] as const;

      for (const { coll, fields } of specs) {
        const set: Record<string, unknown> = {};
        for (const f of fields) {
          set[f] = {
            $toInt: { $round: [{ $multiply: [{ $round: [`$${f}`, 2] }, 100] }, 0] },
          };
        }
        const r = await db.collection(coll).updateMany({}, [{ $set: set }]);
        out.push(`${coll}: ${r.modifiedCount}`);
      }

      for (const [coll, arr] of [['debts', 'payments'], ['goals', 'contributions']] as const) {
        const r = await db.collection(coll).updateMany({}, [
          {
            $set: {
              [arr]: {
                $map: {
                  input: `$${arr}`,
                  as: 'p',
                  in: {
                    $mergeObjects: [
                      '$$p',
                      {
                        amount: {
                          $toInt: {
                            $round: [
                              { $multiply: [{ $round: ['$$p.amount', 2] }, 100] },
                              0,
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        ]);
        out.push(`${coll}.${arr}: ${r.modifiedCount}`);
      }

      return out.join(' · ');
    },
  },
  {
    id: '003-category-ink',
    async run() {
      const map: Record<string, number> = {
        '#ef4444': 0, '#f97316': 1, '#f59e0b': 1, '#dc2626': 11,
        '#7c3aed': 5, '#10b981': 2, '#6366f1': 4, '#8b5cf6': 5,
        '#ec4899': 7, '#3b82f6': 4, '#a855f7': 6, '#14b8a6': 3,
        '#22c55e': 2, '#f43f5e': 0, '#0ea5e9': 4, '#64748b': 10,
      };
      let n = 0;
      for (const [hex, ink] of Object.entries(map)) {
        const r = await mongoose.connection
          .collection('categories')
          .updateMany({ color: hex }, { $set: { ink }, $unset: { color: '' } });
        n += r.modifiedCount;
      }
      await mongoose.connection
        .collection('categories')
        .updateMany({ ink: { $exists: false } }, { $set: { ink: 10 }, $unset: { color: '' } });
      return `categories.ink: ${n}`;
    },
  },
  {
    id: '004-password-changed-at',
    async run() {
      const r = await mongoose.connection
        .collection('users')
        .updateMany({ passwordChangedAt: { $exists: false } }, [
          { $set: { passwordChangedAt: '$createdAt' } },
        ]);
      return `users.passwordChangedAt: ${r.modifiedCount}`;
    },
  },
  {
    id: '005-emoji-to-icon-name',
    async run() {

      const db = mongoose.connection;
      const out: string[] = [];

      for (const coll of ['categories', 'accounts', 'goals'] as const) {
        let moved = 0;
        for (const [emoji, name] of Object.entries(EMOJI_TO_ICON)) {
          const r = await db.collection(coll).updateMany(
            { icon: emoji },
            { $set: { icon: name } },
          );
          moved += r.modifiedCount;
        }

        const leftovers = await db.collection(coll).updateMany(
          { icon: { $nin: [...ICON_NAMES] } },
          { $set: { icon: coll === 'accounts' ? 'users' : 'circle' } },
        );
        out.push(`${coll}: ${moved} опознано, ${leftovers.modifiedCount} в circle`);
      }
      return out.join(' · ');
    },
  },
  {
    id: '006-sprint4-fields',
    async run() {
      const db = mongoose.connection;

      const backfilled = await db.collection('transactions').updateMany(
        { transfer: { $exists: false } },
        {
          $set: {
            transfer: null,
            split: [],
            recurringParent: null,
            recurringAnchorDay: null,
            recurringStoppedAt: null,
          },
        },
      );

      const orphanRules = await db
        .collection('transactions')
        .find({ isRecurring: true, recurringPeriod: { $ne: null }, nextRunAt: null })
        .toArray();

      let activated = 0;
      for (const rule of orphanRules) {
        const period = rule.recurringPeriod as RecurringPeriod;
        const date = rule.date as Date;
        const anchor = date.getUTCDate();
        await db.collection('transactions').updateOne(
          { _id: rule._id },
          { $set: { recurringAnchorDay: anchor, nextRunAt: nextOccurrence(date, period, anchor) } },
        );
        activated += 1;
      }

      return `transactions: ${backfilled.modifiedCount} дополнено · серий активировано: ${activated}`;
    },
  },
];

async function main(): Promise<void> {
  await connectDB();
  const applied = mongoose.connection.collection('_migrations');

  for (const step of steps) {
    if (await applied.findOne({ _id: step.id as never })) {
      logger.info({ step: step.id }, 'пропущено (уже применено)');
      continue;
    }
    const summary = await step.run();
    await applied.insertOne({ _id: step.id as never, at: new Date(), summary });
    logger.info({ step: step.id, summary }, 'применено');
  }

  await mongoose.syncIndexes();
  logger.info('индексы синхронизированы');
  await disconnectDB();
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'миграция провалилась');
  process.exit(1);
});