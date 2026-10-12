import { Types, type HydratedDocument } from 'mongoose';
import { Account, type IAccount } from '../models/Account.js';
import { accountNotFound } from './HttpError.js';

export type AccountRole = 'owner' | 'member';

export interface AccountAccess {
  account: HydratedDocument<IAccount>;
  role: AccountRole;
}

export async function requireAccountAccess(
  accountId: string | Types.ObjectId,
  userId: Types.ObjectId,
): Promise<AccountAccess> {
  const account = await Account.findOne({
    _id: accountId,
    $or: [
      { owner: userId },
      { members: { $elemMatch: { user: userId, status: 'active' } } },
    ],
  });

  if (!account) throw accountNotFound();

  return {
    account,
    role: account.owner.equals(userId) ? 'owner' : 'member',
  };
}

export async function requireAccountOwner(
  accountId: string | Types.ObjectId,
  userId: Types.ObjectId,
): Promise<HydratedDocument<IAccount>> {
  const account = await Account.findOne({ _id: accountId, owner: userId });
  if (!account) throw accountNotFound();
  return account;
}

export function participantIds(account: IAccount): Types.ObjectId[] {
  return [
    account.owner,
    ...account.members.filter((m) => m.status === 'active').map((m) => m.user),
  ];
}