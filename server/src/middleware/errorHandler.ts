import { randomUUID } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Error as MongooseError, mongo } from 'mongoose';
import type { ApiError } from '@accountant/shared';
import { HttpError } from '../lib/HttpError.js';
import { isProd } from '../config/env.js';
import { logger } from '../lib/logger.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiError = {
    code: 'error.routeNotFound',
    message: `Маршрут ${req.method} ${req.path} не найден`,
    params: { method: req.method, path: req.path },
  };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = { code: err.code, message: err.message };
    if (err.fields) body.fields = err.fields;
    if (err.params) body.params = err.params;
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    const fields: Record<string, string> = {};
    for (const [key, e] of Object.entries(err.errors)) fields[key] = e.message;
    const body: ApiError = {
      code: 'error.validation',
      message: Object.values(fields)[0] ?? 'Некорректные данные',
      fields,
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof MongooseError.CastError) {
    const body: ApiError = {
      code: 'error.invalidId',
      message: 'Некорректный идентификатор',
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof mongo.MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'значение';
    const label = field === 'email' ? 'Email' : field;
    const body: ApiError = {
      code: 'error.duplicate',
      message: `${label} уже используется`,
      params: { field: label },
    };
    res.status(409).json(body);
    return;
  }

  const ref = randomUUID();
  logger.error({ err, ref, reqId: req.id, path: req.path }, 'необработанная ошибка');

  const body: ApiError = {
    code: 'error.internal',
    message: isProd
      ? 'Внутренняя ошибка сервера. Попробуйте позже.'
      : ((err as Error)?.message ?? 'Внутренняя ошибка сервера'),
    ref,
  };
  res.status(500).json(body);
};
