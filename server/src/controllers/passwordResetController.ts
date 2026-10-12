import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import { confirmResetBody, requestResetBody } from '@accountant/shared';
import { User } from '../models/User.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { valid } from '../middleware/validate.js';
import { badRequest } from '../lib/HttpError.js';
import { isProd } from '../config/env.js';
import { logger } from '../lib/logger.js';

const TTL_MINUTES = 30;

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export const requestReset: RequestHandler = async (req, res, next) => {
  try {
    const { email } = valid<typeof requestResetBody>(req, 'body');
    const user = await User.findOne({ email }).select('_id').lean();

    const payload: { ok: true; devToken?: string } = { ok: true };

    if (user) {
      const token = randomBytes(32).toString('base64url');
      await PasswordReset.create({
        user: user._id,
        tokenHash: hash(token),
        expiresAt: new Date(Date.now() + TTL_MINUTES * 60_000),
      });

      logger.warn(
        { userId: user._id, ttlMinutes: TTL_MINUTES },
        'password reset: письмо НЕ отправлено, провайдер не настроен',
      );
      if (!isProd) payload.devToken = token;
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const confirmReset: RequestHandler = async (req, res, next) => {
  try {
    const { token, password } = valid<typeof confirmResetBody>(req, 'body');

    const record = await PasswordReset.findOne({
      tokenHash: hash(token),
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!record) throw badRequest('Ссылка недействительна или истекла');

    const user = await User.findById(record.user).select('+password');
    if (!user) throw badRequest('Ссылка недействительна или истекла');

    user.password = password;
    await user.save();

    record.usedAt = new Date();
    await record.save();
    await PasswordReset.deleteMany({ user: user._id, usedAt: null });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};