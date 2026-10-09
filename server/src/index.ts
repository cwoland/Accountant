import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import express from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { env, isProd } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { protect } from './middleware/auth.js';
import { forbidden } from './lib/HttpError.js';

import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import aiRoutes from './routes/ai.js';
import debtRoutes from './routes/debts.js';
import messageRoutes from './routes/messages.js';
import goalRoutes from './routes/goals.js';
import pushRoutes from './routes/push.js';
import budgetRoutes from './routes/budget.js';
import pendingRoutes from './routes/pending.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  pinoHttp({
    logger,
    genReqId: (req: IncomingMessage, res: ServerResponse): string => {
      const incoming = req.headers['x-request-id'];
      const id = typeof incoming === 'string' ? incoming : randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    autoLogging: { ignore: (req: IncomingMessage) => req.url === '/api/health' },
  }),
);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (env.CLIENT_URL.includes(normalized)) return callback(null, true);
    logger.warn({ origin }, 'CORS: источник отклонён');
    // Именно HttpError, а не голый Error: иначе обработчик ошибок считает
    // это внутренним сбоем и отвечает 500 с ref в логе, хотя отказ штатный.
    callback(forbidden('Источник не разрешён политикой CORS'));
  },
  credentials: true,
  maxAge: 86_400,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '256kb' }));

const userKey = (req: express.Request): string =>
  req.user?._id.toString() ?? ipKeyGenerator(req.ip ?? '');

const limiter = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: userKey,
    message: { message },
  });

const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
});

const aiLimiter = limiter(60 * 60_000, 30, 'Лимит запросов к ИИ исчерпан. Попробуйте через час.');
const chatLimiter = limiter(60_000, 120, 'Слишком много запросов к чату.');
const apiLimiter = limiter(15 * 60_000, 1200, 'Слишком много запросов. Попробуйте позже.');

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/password', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/push', pushRoutes);

app.use('/api/ai', protect, aiLimiter, aiRoutes);
app.use('/api/messages', protect, chatLimiter, messageRoutes);
app.use('/api/accounts', protect, apiLimiter, accountRoutes);
app.use('/api/transactions', protect, apiLimiter, transactionRoutes);
app.use('/api/categories', protect, apiLimiter, categoryRoutes);
app.use('/api/debts', protect, apiLimiter, debtRoutes);
app.use('/api/goals', protect, apiLimiter, goalRoutes);
app.use('/api/budget', protect, apiLimiter, budgetRoutes);
app.use('/api/pending', protect, apiLimiter, pendingRoutes);

app.use('/api', notFoundHandler);
app.use(errorHandler);

const server = await (async () => {
  await connectDB();
  return app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'сервер запущен');
  });
})();

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'остановка сервера');

  const force = setTimeout(() => {
    logger.error('принудительное завершение после 10с');
    process.exit(1);
  }, 10_000);
  force.unref();

  server.close(async () => {
    try {
      await disconnectDB();
      logger.info('остановлено штатно');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'ошибка при остановке');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'unhandledRejection');
  void shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  void shutdown('uncaughtException');
});

export { app, isProd };