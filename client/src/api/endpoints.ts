import type {
  AccountDto, AiAnswerDto, AuthDto, BudgetDto, CategoryDto, DebtDto, GoalDto,
  IconName, MessagePage, Minor, Paginated, PendingItemDto, StatsDto,
  TransactionDto, UserDto,
} from '@accountant/shared';
import { api } from './client';

/*
  Весь контракт с сервером в одном файле и с типами из @accountant/shared.
  Раньше это были девять файлов без единого типа, с расхождениями вроде
  ?q против ?query и stats против summary — их ловили только в проде.
*/

/* ── auth ─────────────────────────────────────────────────────── */

export const loginApi = (body: { email: string; password: string }) =>
  api.post<AuthDto>('/auth/login', body);

export const registerApi = (body: { name: string; email: string; password: string }) =>
  api.post<AuthDto>('/auth/register', body);

export const getMeApi = () => api.get<UserDto>('/auth/me');

export const updateProfileApi = (body: {
  name?: string;
  currency?: UserDto['currency'];
  monthlyBudget?: number;
  avatar?: string;
}) => api.put<UserDto>('/auth/profile', body);

export const changePasswordApi = (body: { currentPassword: string; newPassword: string }) =>
  api.put<AuthDto>('/auth/password', body);

export const completeOnboardingApi = () => api.post<UserDto>('/auth/onboarding-complete');

/** Email наружу сервер не отдаёт — приглашаем по тому, что ввёл пользователь. */
export const searchUsersApi = (q: string) =>
  api.get<Pick<UserDto, '_id' | 'name' | 'avatar'>[]>('/auth/search', { params: { q } });

/* ── transactions ─────────────────────────────────────────────── */

export interface TxQuery {
  accountId?: string | undefined;
  type?: 'income' | 'expense';
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  order?: 'asc' | 'desc';
}

export const getTransactionsApi = (params: TxQuery = {}) =>
  api.get<Paginated<TransactionDto>>('/transactions', { params });

export const getStatsApi = (params: {
  accountId?: string | undefined;
  startDate?: string;
  endDate?: string;
}) => api.get<StatsDto>('/transactions/stats', { params });

export interface TxBody {
  accountId?: string | null;
  type: 'income' | 'expense';
  /** Копейки, целое. */
  amount: number;
  category: string;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  tags?: string[];
}

export const createTransactionApi = (body: TxBody) =>
  api.post<TransactionDto>('/transactions', body);

export const updateTransactionApi = (id: string, body: Partial<TxBody>) =>
  api.put<TransactionDto>(`/transactions/${id}`, body);

/** 204 без тела — сервер больше не возвращает { message }. */
export const deleteTransactionApi = (id: string) => api.delete<void>(`/transactions/${id}`);

/* ── categories ───────────────────────────────────────────────── */

export const getCategoriesApi = () => api.get<CategoryDto[]>('/categories');

export const createCategoryApi = (body: {
  name: string; type?: 'income' | 'expense' | 'both';
  icon?: IconName; ink?: number; isMandatory?: boolean; dueDay?: number | null;
}) => api.post<CategoryDto>('/categories', body);

export const updateCategoryApi = (id: string, body: Partial<Parameters<typeof createCategoryApi>[0]>) =>
  api.put<CategoryDto>(`/categories/${id}`, body);

export const archiveCategoryApi = (id: string) =>
  api.delete<{ archived: boolean; affectedTransactions: number }>(`/categories/${id}`);

export const hideCategoryApi = (id: string) => api.post<void>(`/categories/${id}/hide`);
export const unhideCategoryApi = (id: string) => api.post<void>(`/categories/${id}/unhide`);

/* ── budget ───────────────────────────────────────────────────── */

export const getBudgetApi = (params: { year: number; month: number }) =>
  api.get<BudgetDto>('/budget', { params });

export const setBudgetApi = (body: { year: number; month: number; amount: number }) =>
  api.post<BudgetDto>('/budget', body);

/* ── accounts ─────────────────────────────────────────────────── */

export const getAccountsApi = () => api.get<AccountDto[]>('/accounts');
export const getInvitesApi = () => api.get<AccountDto[]>('/accounts/invites');

export const createAccountApi = (body: {
  name: string; inviteEmail: string; currency?: UserDto['currency']; color?: string; icon?: IconName;
}) => api.post<AccountDto>('/accounts', body);

export const acceptInviteApi = (id: string) => api.post<AccountDto>(`/accounts/${id}/accept`);
export const declineInviteApi = (id: string) => api.post<void>(`/accounts/${id}/decline`);
/** Стал POST: раньше был DELETE, что не отражало смысла. */
export const leaveAccountApi = (id: string) => api.post<void>(`/accounts/${id}/leave`);
/** Архив, а не удаление: транзакции сохраняют связь со счётом. */
export const archiveAccountApi = (id: string) => api.post<void>(`/accounts/${id}/archive`);
export const purgeAccountApi = (id: string) =>
  api.delete<{ deletedTransactions: number; deletedMessages: number }>(`/accounts/${id}`);

export const getAccountStatsApi = (id: string) =>
  api.get<{
    account: AccountDto;
    role: 'owner' | 'member';
    stats: StatsDto;
    byUser: { userId: string; name: string; avatar: string; expense: Minor; income: Minor; count: number }[];
  }>(`/accounts/${id}/stats`);

/* ── messages ─────────────────────────────────────────────────── */

export const getMessagesApi = (accountId: string, params: { before?: string; limit?: number } = {}) =>
  api.get<MessagePage>(`/messages/${accountId}`, { params });

export const sendMessageApi = (accountId: string, text: string) =>
  api.post<MessagePage['items'][number]>(`/messages/${accountId}`, { text });

/* ── debts & goals ────────────────────────────────────────────── */

export const getDebtsApi = () => api.get<DebtDto[]>('/debts');
export const createDebtApi = (body: {
  name: string; totalAmount: number; currency?: UserDto['currency'];
  dueDate?: string; isOwed?: boolean; creditor?: string; note?: string;
}) => api.post<DebtDto>('/debts', body);
export const addDebtPaymentApi = (id: string, body: { amount: number; note?: string }) =>
  api.post<DebtDto>(`/debts/${id}/payment`, body);
export const deleteDebtApi = (id: string) => api.delete<void>(`/debts/${id}`);

export const getGoalsApi = () => api.get<GoalDto[]>('/goals');
export const createGoalApi = (body: {
  name: string; targetAmount: number; currency?: UserDto['currency'];
  deadline?: string; icon?: IconName; ink?: number; note?: string;
}) => api.post<GoalDto>('/goals', body);
export const contributeGoalApi = (id: string, body: { amount: number; note?: string }) =>
  api.post<GoalDto>(`/goals/${id}/contribute`, body);
export const deleteGoalApi = (id: string) => api.delete<void>(`/goals/${id}`);

/* ── pending & ai & push ──────────────────────────────────────── */

export const getPendingRawApi = (params: { accountId?: string | undefined }) =>
  api.get<PendingItemDto[]>('/pending', { params });

/** Одна ручка вместо трёх: сервер сам считает агрегаты. */
export const askAiApi = (body: {
  question?: string; startDate?: string; endDate?: string; accountId?: string;
}) => api.post<AiAnswerDto>('/ai/ask', body);

/** Возвращает id, а не имя — искать категорию по строке больше не нужно. */
export const categorizeApi = (description: string) =>
  api.post<{ categoryId: string | null; name: string | null }>('/ai/categorize', { description });

export const getVapidKeyApi = () => api.get<{ publicKey: string }>('/push/vapid-key');
export const subscribePushApi = (subscription: PushSubscriptionJSON) =>
  api.post<void>('/push/subscribe', { subscription });
export const unsubscribePushApi = (endpoint?: string) =>
  api.delete<void>('/push/subscribe', { data: { endpoint } });
