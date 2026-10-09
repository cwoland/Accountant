import pino from 'pino';
import { env, isProd } from '../config/env.js';

export const logger = pino({
  level: isProd ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.newPassword',
      'req.body.currentPassword',
      'req.body.token',
    ],
    censor: '[скрыто]',
  },
  ...(isProd
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
  base: { env: env.NODE_ENV },
});