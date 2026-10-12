import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { HydratedDocument } from 'mongoose';
import { env } from '../config/env.js';
import { User, type IUser } from '../models/User.js';
import { forbidden, sessionExpired, unauthorized } from '../lib/HttpError.js';

interface TokenPayload extends JwtPayload {
  id: string;
  pwd: number;
}

function readBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export const protect: RequestHandler = async (req, _res, next) => {
  try {
    const token = readBearer(req.headers.authorization);
    if (!token) throw unauthorized('Требуется авторизация');

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw sessionExpired();
    }

    const user: HydratedDocument<IUser> | null = await User.findById(payload.id);
    if (!user) throw sessionExpired();

    const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (typeof payload.pwd !== 'number' || payload.pwd < changedAt) {
      throw sessionExpired('Пароль был изменён. Войдите снова.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export function currentUser(req: Express.Request): HydratedDocument<IUser> {
  if (!req.user) throw unauthorized();
  return req.user;
}

export function requireCronSecret(secret: string | undefined): RequestHandler {
  return (req, _res, next) => {
    if (!secret) return next(forbidden('Эндпоинт отключён'));
    const header = req.get('x-cron-secret');
    if (header !== secret) return next(forbidden('Нет доступа'));
    next();
  };
}