import type { Currency, Minor } from './money.js';
import type { IconName } from './icons.js';

export type Id = string;

export interface UserDto {
  _id: Id;
  name: string;
  email: string;
  avatar: string;
  currency: Currency;
  monthlyBudget: Minor;
  onboardingCompleted: boolean;
}

export interface AuthDto {
  user: UserDto;
  token: string;
}

export interface CategoryDto {
  _id: Id;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: IconName;
  ink: number;
  isMandatory: boolean;
  isSystem: boolean;
}

export interface TransactionDto {
  _id: Id;
  account: Id | null;
  user: Id;
  type: 'income' | 'expense';
  amount: Minor;
  category: CategoryDto | null;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  tags: string[];
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pages: number;
  limit: number;
  total: number;
}

export interface CategorySlice {
  categoryId: Id;
  name: string;
  icon: IconName;
  ink: number;
  type: 'income' | 'expense';
  total: Minor;
  count: number;
}

export interface MonthPoint {
  year: number;
  month: number;
  income: Minor;
  expense: Minor;
}

export interface StatsDto {
  summary: { income: Minor; expense: Minor; balance: Minor };
  byCategory: CategorySlice[];
  monthly: MonthPoint[];
}

export interface BudgetDto {
  year: number;
  month: number;
  amount: Minor;
  isDefault: boolean;
}

export interface MemberDto {
  user: Pick<UserDto, '_id' | 'name' | 'email' | 'avatar'>;
  status: 'pending' | 'active';
  joinedAt: string | null;
}

export interface AccountDto {
  _id: Id;
  name: string;
  owner: Pick<UserDto, '_id' | 'name' | 'email' | 'avatar'>;
  members: MemberDto[];
  currency: Currency;
  color: string;
  icon: IconName;
  role: 'owner' | 'member';
}

export interface ApiError {
  message: string;
  fields?: Record<string, string>;
  ref?: string;
}

export interface PaymentDto {
  amount: Minor;
  date: string;
  note: string;
}

export interface DebtDto {
  _id: Id;
  name: string;
  totalAmount: Minor;
  paidAmount: Minor;
  remaining: Minor;
  currency: Currency;
  dueDate: string | null;
  isOwed: boolean;
  creditor: string;
  note: string;
  settled: boolean;
  payments: PaymentDto[];
  createdAt: string;
}

export interface GoalDto {
  _id: Id;
  name: string;
  targetAmount: Minor;
  currentAmount: Minor;
  remaining: Minor;
  currency: Currency;
  deadline: string | null;
  icon: IconName;
  ink: number;
  note: string;
  completed: boolean;
  contributions: PaymentDto[];
  createdAt: string;
}

export interface MessageDto {
  _id: Id;
  account: Id;
  user: Pick<UserDto, '_id' | 'name' | 'avatar'>;
  text: string;
  createdAt: string;
}

export interface MessagePage {
  items: MessageDto[];
  hasMore: boolean;
}

export interface AiAnswerDto {
  text: string;
  basis: { from: string; to: string; income: Minor; expense: Minor };
}

export interface PendingItemDto {
  kind: 'mandatory' | 'debt' | 'goal' | 'queued';
  id: Id;
  title: string;
  subtitle: string;
  amount: Minor | null;
  ink: number;
  dueDate: string | null;
  url: string;
}