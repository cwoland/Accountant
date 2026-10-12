import type {
  CategoryBudgetDto, SettlementDto, TransferDto,
  AccountDto, AiAnswerDto, AuthDto, BudgetDto, CategoryDto, DebtDto, GoalDto,
  IconName, MessagePage, Minor, Paginated, PendingItemDto, StatsDto,
  TransactionDto, UserDto,
} from '@accountant/shared';
import { api } from './client';

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

export const searchUsersApi = (q: string) =>
  api.get<Pick<UserDto, '_id' | 'name' | 'avatar'>[]>('/auth/search', { params: { q } });

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

export const deleteTransactionApi = (id: string) => api.delete<void>(`/transactions/${id}`);

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

export const getBudgetApi = (params: { year: number; month: number }) =>
  api.get<BudgetDto>('/budget', { params });

export const setBudgetApi = (body: { year: number; month: number; amount: number }) =>
  api.post<BudgetDto>('/budget', body);

export const getAccountsApi = () => api.get<AccountDto[]>('/accounts');
export const getInvitesApi = () => api.get<AccountDto[]>('/accounts/invites');

export const createAccountApi = (body: {
  name: string; inviteEmail: string; currency?: UserDto['currency']; color?: string; icon?: IconName;
}) => api.post<AccountDto>('/accounts', body);

export const acceptInviteApi = (id: string) => api.post<AccountDto>(`/accounts/${id}/accept`);
export const declineInviteApi = (id: string) => api.post<void>(`/accounts/${id}/decline`);

export const leaveAccountApi = (id: string) => api.post<void>(`/accounts/${id}/leave`);

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

export const getMessagesApi = (accountId: string, params: { before?: string; limit?: number } = {}) =>
  api.get<MessagePage>(`/messages/${accountId}`, { params });

export const sendMessageApi = (accountId: string, text: string) =>
  api.post<MessagePage['items'][number]>(`/messages/${accountId}`, { text });

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

export const getPendingRawApi = (params: { accountId?: string | undefined }) =>
  api.get<PendingItemDto[]>('/pending', { params });

export const askAiApi = (body: {
  question?: string; startDate?: string; endDate?: string; accountId?: string;
}) => api.post<AiAnswerDto>('/ai/ask', body);

export const categorizeApi = (description: string) =>
  api.post<{ categoryId: string | null; name: string | null }>('/ai/categorize', { description });

export const getVapidKeyApi = () => api.get<{ publicKey: string }>('/push/vapid-key');
export const subscribePushApi = (subscription: PushSubscriptionJSON) =>
  api.post<void>('/push/subscribe', { subscription });
export const unsubscribePushApi = (endpoint?: string) =>
  api.delete<void>('/push/subscribe', { data: { endpoint } });

export const createTransferApi = (body: {
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  date?: string;
  note?: string;
}) => api.post<TransferDto>('/transfers', body);

export const deleteTransferApi = (transferId: string) =>
  api.delete<void>(`/transfers/${transferId}`);

export const getCategoryBudgetsApi = (params: { year: number; month: number }) =>
  api.get<CategoryBudgetDto[]>('/category-budgets', { params });

export const setCategoryBudgetsApi = (body: {
  year: number;
  month: number;
  items: { category: string; amount: number }[];
}) => api.post<void>('/category-budgets', body);

export const setSplitApi = (transactionId: string, shares: { user: string; share: number }[]) =>
  api.put<void>(`/split/transaction/${transactionId}`, { shares });

export const clearSplitApi = (transactionId: string) =>
  api.delete<void>(`/split/transaction/${transactionId}`);

export const getSettlementApi = (accountId: string) =>
  api.get<SettlementDto>(`/split/account/${accountId}`);

export const forgotPasswordApi = (email: string) =>
  api.post<{ ok: true; devToken?: string }>('/auth/password/forgot', { email });

export const resetPasswordApi = (body: { token: string; password: string }) =>
  api.post<void>('/auth/password/reset', body);
