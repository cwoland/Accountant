import type { HydratedDocument, Types } from 'mongoose';
import { asMinor, toIconName } from '@accountant/shared';
import type {
  CategoryDto,
  TransactionDto,
  UserDto,
  AccountDto,
  Currency,
} from '@accountant/shared';
import type { IUser } from '../models/User.js';
import type { ITransaction } from '../models/Transaction.js';
import type { ICategory } from '../models/Category.js';
import type { IAccount } from '../models/Account.js';

const id = (v: Types.ObjectId | string): string => v.toString();

export function toUserDto(u: HydratedDocument<IUser> | IUser): UserDto {
  return {
    _id: id(u._id),
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    currency: u.currency as Currency,
    monthlyBudget: u.monthlyBudget as UserDto['monthlyBudget'],
    onboardingCompleted: u.onboardingCompleted,
  };
}

export function toCategoryDto(c: ICategory): CategoryDto {
  return {
    _id: id(c._id),
    name: c.name,
    type: c.type,
    icon: toIconName(c.icon),
    ink: c.ink,
    isMandatory: c.isMandatory,
    isSystem: c.isSystem,
    dueDay: c.dueDay,
  };
}

type PopulatedTx = Omit<ITransaction, 'category'> & {
  category: ICategory | Types.ObjectId | null;
};

export function toTransactionDto(t: PopulatedTx): TransactionDto {
  const cat = t.category && 'name' in t.category ? toCategoryDto(t.category) : null;
  return {
    _id: id(t._id),
    account: t.account ? id(t.account) : null,
    user: id(t.user),
    type: t.type,
    amount: t.amount as TransactionDto['amount'],
    category: cat,
    description: t.description,
    date: t.date.toISOString(),
    isRecurring: t.isRecurring,
    recurringPeriod: t.recurringPeriod,
    tags: t.tags,
    transfer: t.transfer ? id(t.transfer) : null,
    split: (t.split ?? []).map((s) => ({ user: id(s.user), share: asMinor(s.share) })),
    createdAt: t.createdAt.toISOString(),
  };
}

type PopulatedAccount = Omit<IAccount, 'owner' | 'members'> & {
  owner: IUser;
  members: { user: IUser; status: 'pending' | 'active'; joinedAt: Date | null }[];
};

export function toAccountDto(
  a: PopulatedAccount,
  viewerId: Types.ObjectId,
): AccountDto {
  const person = (u: IUser) => ({
    _id: id(u._id),
    name: u.name,
    email: u.email,
    avatar: u.avatar,
  });
  return {
    _id: id(a._id),
    name: a.name,
    owner: person(a.owner),
    members: a.members.map((m) => ({
      user: person(m.user),
      status: m.status,
      joinedAt: m.joinedAt ? m.joinedAt.toISOString() : null,
    })),
    currency: a.currency as Currency,
    color: a.color,
    icon: toIconName(a.icon, 'users'),
    role: id(a.owner._id) === id(viewerId) ? 'owner' : 'member',
  };
}