import { Types } from 'mongoose';
import { asMinor, toIconName, type StatsDto } from '@accountant/shared';
import { Transaction } from '../models/Transaction.js';
import { Category } from '../models/Category.js';
import { APP_TZ, type Range } from '../lib/dates.js';

export type StatsScope =
  | { user: Types.ObjectId; account: null }
  | { account: Types.ObjectId };

interface FacetResult {
  summary: { _id: 'income' | 'expense'; total: number }[];
  byCategory: {
    _id: { category: Types.ObjectId | null; type: 'income' | 'expense' };
    total: number;
    count: number;
    cat: { name: string; icon: string; ink: number }[];
  }[];
  monthly: {
    _id: { year: number; month: number; type: 'income' | 'expense' };
    total: number;
  }[];
}

export async function computeStats(
  scope: StatsScope,
  range: Partial<Range> = {},
): Promise<StatsDto> {
  const match: Record<string, unknown> = { ...scope };
  if (range.start || range.end) {
    match.date = {
      ...(range.start ? { $gte: range.start } : {}),
      ...(range.end ? { $lt: range.end } : {}),
    };
  }

  const [agg] = await Transaction.aggregate<FacetResult>([
    { $match: match },
    {
      $facet: {
        summary: [{ $group: { _id: '$type', total: { $sum: '$amount' } } }],
        byCategory: [
          {
            $group: {
              _id: { category: '$category', type: '$type' },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: Category.collection.name,
              localField: '_id.category',
              foreignField: '_id',
              as: 'cat',
              pipeline: [{ $project: { name: 1, icon: 1, ink: 1 } }],
            },
          },
          { $sort: { total: -1 } },
        ],
        monthly: [
          {
            $group: {
              _id: {
                year: { $year: { date: '$date', timezone: APP_TZ } },
                month: { $month: { date: '$date', timezone: APP_TZ } },
                type: '$type',
              },
              total: { $sum: '$amount' },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ],
      },
    },
  ]);

  const income = agg?.summary.find((s) => s._id === 'income')?.total ?? 0;
  const expense = agg?.summary.find((s) => s._id === 'expense')?.total ?? 0;

  const monthMap = new Map<string, StatsDto['monthly'][number]>();
  for (const row of agg?.monthly ?? []) {
    const key = `${row._id.year}-${row._id.month}`;
    const point = monthMap.get(key) ?? {
      year: row._id.year,
      month: row._id.month,
      income: asMinor(0),
      expense: asMinor(0),
    };
    point[row._id.type] = asMinor(row.total);
    monthMap.set(key, point);
  }

  return {
    summary: {
      income: asMinor(income),
      expense: asMinor(expense),
      balance: asMinor(income - expense),
    },
    byCategory: (agg?.byCategory ?? []).map((row) => {
      const cat = row.cat[0];
      return {
        categoryId: row._id.category?.toString() ?? 'none',
        name: cat?.name ?? 'Без категории',
        icon: toIconName(cat?.icon),
        ink: cat?.ink ?? 10,
        type: row._id.type,
        total: asMinor(row.total),
        count: row.count,
      };
    }),
    monthly: [...monthMap.values()],
  };
}