import { Router } from 'express';
import { env, pushEnabled } from '../config/env.js';
import { protect, requireCronSecret } from '../middleware/auth.js';
import {
  subscribe,
  unsubscribe,
  getVapidKey,
  notifyMandatory,
  notifyMonthlyStats,
} from '../controllers/pushController.js';
import { serviceUnavailable } from '../lib/HttpError.js';

const router = Router();

router.use((_req, _res, next) =>
  pushEnabled ? next() : next(serviceUnavailable('Push-уведомления не настроены')),
);

router.get('/vapid-key', getVapidKey);
router.post('/subscribe', protect, subscribe);
router.delete('/subscribe', protect, unsubscribe);

const cronOnly = Router();
cronOnly.use(requireCronSecret(env.CRON_SECRET));
cronOnly.post('/notify-mandatory', notifyMandatory);
cronOnly.post('/notify-monthly', notifyMonthlyStats);
router.use('/cron', cronOnly);

export default router;