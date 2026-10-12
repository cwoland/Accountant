import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { HydratedDocument } from 'mongoose';
import {
  changePasswordBody,
  loginBody,
  registerBody,
  searchQuery,
  updateProfileBody,
  type AuthDto,
  type UserDto,
} from '@accountant/shared';
import { env } from '../config/env.js';
import { User, type IUser } from '../models/User.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badCredentials, emailTaken, unauthorized } from '../lib/HttpError.js';
import { prefixSearch } from '../lib/escapeRegex.js';
import { toUserDto } from '../lib/serializers.js';

function issueToken(user: HydratedDocument<IUser>): string {
  return jwt.sign(
    { id: user._id.toString(), pwd: Math.floor(user.passwordChangedAt.getTime() / 1000) },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

const authPayload = (user: HydratedDocument<IUser>): AuthDto => ({
  user: toUserDto(user),
  token: issueToken(user),
});

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = valid<typeof registerBody>(req, 'body');

    if (await User.exists({ email })) {
      throw emailTaken();
    }

    const user = await User.create({ name, email, password });
    res.status(201).json(authPayload(user));
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = valid<typeof loginBody>(req, 'body');

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw badCredentials();
    }

    res.json(authPayload(user));
  } catch (err) {
    next(err);
  }
};

export const getMe: RequestHandler = (req, res) => {
  res.json(toUserDto(currentUser(req)));
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof updateProfileBody>(req, 'body');
    const me = currentUser(req);

    if (body.name !== undefined) me.name = body.name;
    if (body.currency !== undefined) me.currency = body.currency;
    if (body.monthlyBudget !== undefined) me.monthlyBudget = body.monthlyBudget;
    if (body.avatar !== undefined) me.avatar = body.avatar;

    await me.save();
    res.json(toUserDto(me));
  } catch (err) {
    next(err);
  }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = valid<typeof changePasswordBody>(req, 'body');

    const user = await User.findById(currentUser(req)._id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      throw unauthorized('Неверный текущий пароль.');
    }

    user.password = newPassword;
    await user.save();

    res.json(authPayload(user));
  } catch (err) {
    next(err);
  }
};

export const searchUsers: RequestHandler = async (req, res, next) => {
  try {
    const { q } = valid<typeof searchQuery>(req, 'query');
    const me = currentUser(req);

    const pattern = prefixSearch(q);
    const users = await User.find({
      _id: { $ne: me._id },
      $or: [{ name: pattern }, { email: q.toLowerCase() }],
    })
      .select('name avatar')
      .limit(10)
      .lean();

    res.json(users.map((u) => ({ _id: u._id.toString(), name: u.name, avatar: u.avatar })));
  } catch (err) {
    next(err);
  }
};

export const completeOnboarding: RequestHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    me.onboardingCompleted = true;
    await me.save();
    const payload: UserDto = toUserDto(me);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};