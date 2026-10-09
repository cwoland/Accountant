import type { AccountIdHandler } from '../types/handlers.js';
import { listMessagesQuery, sendMessageBody } from '@accountant/shared';
import { Message } from '../models/Message.js';
import { requireAccountAccess, participantIds } from '../lib/accountAccess.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { pushToUser } from '../services/pushService.js';
import { logger } from '../lib/logger.js';

export const getMessages: AccountIdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const { before, limit } = valid<typeof listMessagesQuery>(req, 'query');
    const { account } = await requireAccountAccess(req.params.accountId, me._id);

    const filter: Record<string, unknown> = { account: account._id };
    if (before) filter.createdAt = { $lt: before };

    const rows = await Message.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ items: rows.reverse(), hasMore: rows.length === limit });
  } catch (err) {
    next(err);
  }
};

export const sendMessage: AccountIdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const { text } = valid<typeof sendMessageBody>(req, 'body');
    const { account } = await requireAccountAccess(req.params.accountId, me._id);

    const message = await Message.create({
      account: account._id,
      user: me._id,
      text,
    });
    await message.populate('user', 'name avatar');

    res.status(201).json(message.toObject());

    const recipients = participantIds(account).filter((id) => !id.equals(me._id));
    void Promise.allSettled(
      recipients.map((id) =>
        pushToUser(id, {
          title: account.name,
          body: `${me.name}: ${text.slice(0, 80)}`,
          url: `/accounts/${account._id.toString()}`,
        }),
      ),
    ).then((results) => {
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed) logger.warn({ failed, accountId: account._id }, 'push: часть не доставлена');
    });
  } catch (err) {
    next(err);
  }
};