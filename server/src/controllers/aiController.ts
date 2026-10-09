import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import {
  aiAskBody,
  asMinor,
  categorizeBody,
  formatMoney,
  type AiAnswerDto,
} from '@accountant/shared';
import { Category } from '../models/Category.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { requireAccountAccess } from '../lib/accountAccess.js';
import { computeStats, type StatsScope } from '../services/statsService.js';
import { callAI, fence } from '../services/aiService.js';
import { currentMonth, monthRange } from '../lib/dates.js';

const SYSTEM = `Ты финансовый советник в приложении Accountant. Отвечай по-русски,
кратко и конкретно, без вступлений и дисклеймеров. Опирайся только на
переданные цифры — не выдумывай данные, которых нет. Не давай индивидуальных
инвестиционных рекомендаций: говори о принципах и инструментах в общем виде.`;

async function resolveScope(
  req: Express.Request,
  accountId: string | undefined,
): Promise<StatsScope> {
  const me = currentUser(req);
  if (!accountId) return { user: me._id, account: null };
  const { account } = await requireAccountAccess(accountId, me._id);
  return { account: account._id };
}

export const ask: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof aiAskBody>(req, 'body');
    const me = currentUser(req);

    const { year, month } = currentMonth();
    const fallback = monthRange(year, month);
    const range = {
      start: body.startDate ?? fallback.start,
      end: body.endDate ?? fallback.end,
    };

    const scope = await resolveScope(req, body.accountId);
    const stats = await computeStats(scope, range);

    const cur = me.currency;
    const top = stats.byCategory
      .filter((c) => c.type === 'expense')
      .slice(0, 6)
      .map((c) => `${c.name}: ${formatMoney(c.total, cur)}`)
      .join('; ');

    const context = [
      `Период: ${range.start.toISOString().slice(0, 10)} — ${range.end.toISOString().slice(0, 10)}`,
      `Доходы: ${formatMoney(stats.summary.income, cur)}`,
      `Расходы: ${formatMoney(stats.summary.expense, cur)}`,
      `Баланс: ${formatMoney(stats.summary.balance, cur)}`,
      `Месячный бюджет: ${formatMoney(asMinor(me.monthlyBudget), cur)}`,
      top ? `Крупнейшие категории расходов — ${top}` : 'Расходов за период нет.',
    ].join('\n');

    const prompt = body.question
      ? `${context}\n\nВопрос пользователя:\n"""${fence(body.question)}"""`
      : `${context}\n\nСделай разбор за период: на что уходит больше всего, ` +
        `здоров ли баланс, и один конкретный совет. 3–5 предложений.`;

    const text = await callAI([
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt },
    ]);

    const payload: AiAnswerDto = {
      text,
      basis: {
        from: range.start.toISOString(),
        to: range.end.toISOString(),
        income: stats.summary.income,
        expense: stats.summary.expense,
      },
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const categorize: RequestHandler = async (req, res, next) => {
  try {
    const { description } = valid<typeof categorizeBody>(req, 'body');
    const me = currentUser(req);

    const categories = await Category.find({
      archivedAt: null,
      hiddenFor: { $ne: me._id },
      type: { $in: ['expense', 'both'] },
      $or: [{ user: me._id }, { isSystem: true }],
    })
      .select('_id name')
      .lean();

    if (categories.length === 0) {
      res.json({ categoryId: null, name: null });
      return;
    }

    const names = categories.map((c) => c.name);
    const text = await callAI(
      [
        {
          role: 'system',
          content:
            'Ты классификатор. Отвечай ровно одним названием из предложенного ' +
            'списка, без кавычек и пояснений. Если ничего не подходит — ответь "НЕТ".',
        },
        {
          role: 'user',
          content: `Список: ${names.join(' | ')}\nОписание: """${fence(description)}"""`,
        },
      ],
      24,
    );

    const answer = text.trim().replace(/^["'«»]+|["'«»]+$/g, '').toLowerCase();
    const match = categories.find((c) => c.name.toLowerCase() === answer);

    res.json(
      match
        ? { categoryId: (match._id as Types.ObjectId).toString(), name: match.name }
        : { categoryId: null, name: null },
    );
  } catch (err) {
    next(err);
  }
};