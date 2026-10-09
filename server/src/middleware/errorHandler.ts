import { randomUUID } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Error as MongooseError, mongo } from 'mongoose';
import type { ApiError } from '@accountant/shared';
import { HttpError } from '../lib/HttpError.js';
import { isProd } from '../config/env.js';
import { logger } from '../lib/logger.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiError = { message: `Маршрут ${req.method} ${req.path} не найден` };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = { message: err.message };
    if (err.fields) body.fields = err.fields;
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    const fields: Record<string, string> = {};
    for (const [key, e] of Object.entries(err.errors)) fields[key] = e.message;
    res.status(400).json({
      message: Object.values(fields)[0] ?? 'Некорректные данные',
      fields,
    } satisfies ApiError);
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ message: 'Некорректный идентификатор' } satisfies ApiError);
    return;
  }

  if (err instanceof mongo.MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'значение';
    const label = field === 'email' ? 'Email' : field;
    res.status(409).json({ message: `${label} уже используется` } satisfies ApiError);
    return;
  }

  const ref = randomUUID();
  logger.error({ err, ref, reqId: req.id, path: req.path }, 'необработанная ошибка');

  res.status(500).json({
    message: isProd
      ? 'Внутренняя ошибка сервера. Попробуйте позже.'
      : (err as Error)?.message ?? 'Внутренняя ошибка сервера',
    ref,
  } satisfies ApiError);
};