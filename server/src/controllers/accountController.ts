import type { RequestHandler } from 'express';
import type { IdHandler } from '../types/handlers.js';
import { Types } from 'mongoose';
import { createAccountBody, type AccountDto } from '@accountant/shared';
import { Account } from '../models/Account.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { Message } from '../models/Message.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badRequest, conflict, notFound } from '../lib/HttpError.js';
import { requireAccountAccess, requireAccountOwner, participantIds } from '../lib/accountAccess.js';
import { toAccountDto } from '../lib/serializers.js';
import { computeStats } from '../services/statsService.js';
import { pushToUser } from '../services/pushService.js';

const POPULATE = [
  { path: 'owner', select: 'name email avatar' },
  { path: 'members.user', select: 'name email avatar' },
] as const;

export const getAccounts: RequestHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const rows = await Account.find({
      archivedAt: null,
      $or: [
        { owner: me._id },
        { members: { $elemMatch: { user: me._id, status: 'active' } } },
      ],
    })
      .populate(POPULATE as never)
      .sort({ createdAt: 1 })
      .lean();

    res.json(rows.map((a) => toAccountDto(a as never, me._id)));
  } catch (err) {
    next(err);
  }
};

export const getInvites: RequestHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const rows = await Account.find({
      archivedAt: null,
      members: { $elemMatch: { user: me._id, status: 'pending' } },
    })
      .populate(POPULATE as never)
      .lean();

    res.json(rows.map((a) => toAccountDto(a as never, me._id)));
  } catch (err) {
    next(err);
  }
};

export const createAccount: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof createAccountBody>(req, 'body');
    const me = currentUser(req);

    const invitee = await User.findOne({ email: body.inviteEmail }).select('_id').lean();
    if (!invitee) throw notFound('Пользователь с таким email не найден.');
    if (invitee._id.equals(me._id)) {
      throw badRequest('Нельзя пригласить себя.', { inviteEmail: 'Это ваш адрес' });
    }

    const account = await Account.create({
      name: body.name,
      owner: me._id,
      currency: body.currency ?? me.currency,
      color: body.color ?? '#2B5CC4',
      icon: body.icon ?? 'users',
      members: [{ user: invitee._id, status: 'pending', joinedAt: null }],
    });

    await account.populate(POPULATE as never);

    void pushToUser(invitee._id, {
      title: 'Приглашение в совместный счёт',
      body: `${me.name} приглашает вас в «${account.name}»`,
      url: '/accounts',
      tag: `invite-${account._id.toString()}`,
    });

    const dto: AccountDto = toAccountDto(account.toObject() as never, me._id);
    res.status(201).json(dto);
  } catch (err) {
    next(err);
  }
};

export const acceptInvite: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const account = await Account.findOneAndUpdate(
      {
        _id: req.params.id,
        archivedAt: null,
        members: { $elemMatch: { user: me._id, status: 'pending' } },
      },
      { $set: { 'members.$.status': 'active', 'members.$.joinedAt': new Date() } },
      { new: true },
    ).populate(POPULATE as never);

    if (!account) throw notFound('Приглашение не найдено.');
    res.json(toAccountDto(account.toObject() as never, me._id));
  } catch (err) {
    next(err);
  }
};

export const declineInvite: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const result = await Account.updateOne(
      { _id: req.params.id, members: { $elemMatch: { user: me._id, status: 'pending' } } },
      { $pull: { members: { user: me._id } } },
    );
    if (result.modifiedCount === 0) throw notFound('Приглашение не найдено.');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const leaveAccount: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const account = await Account.findById(req.params.id);
    if (!account || account.archivedAt) throw notFound('Счёт не найден.');
    if (account.owner.equals(me._id)) {
      throw conflict('Владелец не может покинуть счёт — передайте права или архивируйте его.');
    }

    const result = await Account.updateOne(
      { _id: account._id },
      { $pull: { members: { user: me._id } } },
    );
    if (result.modifiedCount === 0) throw notFound('Вы не состоите в этом счёте.');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const archiveAccount: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const account = await requireAccountOwner(req.params.id, me._id);

    account.archivedAt = new Date();
    await account.save();

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const purgeAccount: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const account = await requireAccountOwner(req.params.id, me._id);

    const [txs, msgs] = await Promise.all([
      Transaction.deleteMany({ account: account._id }),
      Message.deleteMany({ account: account._id }),
      account.deleteOne(),
    ]);

    res.json({
      deletedTransactions: txs.deletedCount,
      deletedMessages: msgs.deletedCount,
    });
  } catch (err) {
    next(err);
  }
};

export const getAccountStats: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const { account, role } = await requireAccountAccess(req.params.id, me._id);
    await account.populate(POPULATE as never);

    const stats = await computeStats({ account: account._id });

    const perUser = await Transaction.aggregate<{
      _id: Types.ObjectId;
      expense: number;
      income: number;
      count: number;
    }>([
      { $match: { account: account._id } },
      {
        $group: {
          _id: '$user',
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const spent = new Map(perUser.map((r) => [r._id.toString(), r]));
    const people = participantIds(account).map((id) => {
      const row = spent.get(id.toString());
      const member =
        account.owner._id.equals(id)
          ? (account.owner as unknown as { name: string; avatar: string })
          : (account.members.find((m) => m.user._id?.equals(id))?.user as unknown as {
              name: string;
              avatar: string;
            });
      return {
        userId: id.toString(),
        name: member?.name ?? '—',
        avatar: member?.avatar ?? '',
        expense: row?.expense ?? 0,
        income: row?.income ?? 0,
        count: row?.count ?? 0,
      };
    });

    res.json({
      account: toAccountDto(account.toObject() as never, me._id),
      role,
      stats,
      byUser: people,
    });
  } catch (err) {
    next(err);
  }
};