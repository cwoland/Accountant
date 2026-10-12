import { z } from 'zod';
import { CURRENCIES } from './money.js';
import { ICON_NAMES } from './icons.js';

export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Некорректный идентификатор');

export const amountMinor = z
  .number()
  .int('Сумма должна быть целым числом копеек')
  .positive('Сумма должна быть больше нуля')
  .max(1_000_000_000_00, 'Сумма слишком велика');

export const isoDate = z.string().datetime({ offset: true }).or(z.coerce.date());

export const transactionType = z.enum(['income', 'expense']);
export const iconName = z.enum(ICON_NAMES);
export const recurringPeriod = z.enum(['daily', 'weekly', 'monthly', 'yearly']);
export const currency = z.enum(CURRENCIES);

export const passwordSchema = z
  .string()
  .min(10, 'Минимум 10 символов')
  .max(200, 'Слишком длинный пароль')
  .refine((p) => !/^\d+$/.test(p), 'Пароль не может состоять только из цифр');

export const registerBody = z.object({
  name: z.string().trim().min(1, 'Введите имя').max(50),
  email: z.string().trim().toLowerCase().email('Некорректный email'),
  password: passwordSchema,
});

export const loginBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: passwordSchema,
});

export const updateProfileBody = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  currency: currency.optional(),
  monthlyBudget: z.number().int().min(0).max(1_000_000_000_00).optional(),
  avatar: z.string().max(40).optional(),
});

export const searchQuery = z.object({
  q: z.string().trim().min(2, 'Минимум 2 символа').max(60),
});

export const listTransactionsQuery = z.object({
  accountId: objectId.optional(),
  type: transactionType.optional(),
  category: objectId.optional(),
  search: z.string().trim().max(120).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const statsQuery = z.object({
  accountId: objectId.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const createTransactionBody = z.object({
  accountId: objectId.nullish(),
  type: transactionType,
  amount: amountMinor,
  category: objectId,
  description: z.string().trim().max(200).default(''),
  date: z.coerce.date().default(() => new Date()),
  isRecurring: z.boolean().default(false),
  recurringPeriod: recurringPeriod.nullish(),
  tags: z.array(z.string().trim().min(1).max(24)).max(10).default([]),
});

export const createTransferBody = z.object({
  fromAccountId: objectId.nullable(),
  toAccountId: objectId.nullable(),
  amount: amountMinor,
  date: z.coerce.date().default(() => new Date()),
  note: z.string().trim().max(200).default(''),
}).refine((v) => v.fromAccountId !== v.toAccountId, {
  message: 'Счета перевода должны различаться',
  path: ['toAccountId'],
});

export const updateTransactionBody = createTransactionBody
  .omit({ accountId: true })
  .partial();

export const budgetQuery = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const setBudgetBody = budgetQuery.extend({
  amount: z.number().int().min(0).max(1_000_000_000_00),
});

export const createAccountBody = z.object({
  name: z.string().trim().min(1).max(50).default('Совместный счёт'),
  currency: currency.optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: iconName.optional(),
  inviteEmail: z.string().trim().toLowerCase().email('Некорректный email'),
});

export const sendMessageBody = z.object({
  text: z.string().trim().min(1, 'Сообщение не может быть пустым').max(2000),
});

export const listMessagesQuery = z.object({
  before: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const createDebtBody = z.object({
  name: z.string().trim().min(1).max(80),
  totalAmount: amountMinor,
  currency: currency.optional(),
  dueDate: z.coerce.date().optional(),
  isOwed: z.boolean().default(true),
  creditor: z.string().trim().max(80).optional(),
  note: z.string().trim().max(500).optional(),
});

export const contributionBody = z.object({
  amount: amountMinor,
  note: z.string().trim().max(200).optional(),
});

export const createGoalBody = z.object({
  name: z.string().trim().min(1).max(80),
  targetAmount: amountMinor,
  currency: currency.optional(),
  deadline: z.coerce.date().optional(),
  icon: iconName.default('target'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  note: z.string().trim().max(500).optional(),
});

export const aiAskBody = z.object({
  question: z.string().trim().min(3).max(500).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  accountId: objectId.optional(),
});

export const categorizeBody = z.object({
  description: z.string().trim().min(2).max(200),
});

export type RegisterBody = z.infer<typeof registerBody>;
export type LoginBody = z.infer<typeof loginBody>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuery>;
export type CreateTransactionBody = z.infer<typeof createTransactionBody>;
export type UpdateTransactionBody = z.infer<typeof updateTransactionBody>;
export type SetBudgetBody = z.infer<typeof setBudgetBody>;
export type CreateAccountBody = z.infer<typeof createAccountBody>;
export type AiAskBody = z.infer<typeof aiAskBody>;

export const createCategoryBody = z.object({
  name: z.string().trim().min(1, 'Название обязательно').max(50),
  type: z.enum(['income', 'expense', 'both']).default('both'),
  icon: iconName.default('circle'),
  ink: z.number().int().min(0).max(11).default(10),
  isMandatory: z.boolean().default(false),
  dueDay: z.number().int().min(1).max(31).nullish(),
});

export const updateCategoryBody = createCategoryBody.partial();

export const createGoalBodyV2 = createGoalBody
  .omit({ color: true })
  .extend({ ink: z.number().int().min(0).max(11).default(4) });

export const categoryBudgetQuery = budgetQuery;

export const setCategoryBudgetsBody = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  items: z.array(z.object({
    category: objectId,
    amount: z.number().int().min(0).max(1_000_000_000_00),
  })).max(100),
});
export const splitBody = z.object({
  shares: z
    .array(
      z.object({
        user: objectId,
        share: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(20),
});

export const exportQuery = z.object({
  accountId: objectId.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  delimiter: z.enum([';', ',']).default(';'),
});

export const requestResetBody = z.object({
  email: z.string().trim().toLowerCase().email('Некорректный email'),
});

export const confirmResetBody = z.object({
  token: z.string().min(32).max(128),
  password: passwordSchema,
});

export type SplitBody = z.infer<typeof splitBody>;
export type ExportQuery = z.infer<typeof exportQuery>;
