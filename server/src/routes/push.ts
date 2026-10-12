import { Router } from 'express';
import { pushEnabled } from '../config/env.js';
import { protect } from '../middleware/auth.js';
import {
  subscribe,
  unsubscribe,
  getVapidKey,
} from '../controllers/pushController.js';
import { serviceUnavailable } from '../lib/HttpError.js';

const router = Router();

router.use((_req, _res, next) =>
  pushEnabled ? next() : next(serviceUnavailable('Push-уведомления не настроены')),
);

router.get('/vapid-key', getVapidKey);
router.post('/subscribe', protect, subscribe);
router.delete('/subscribe', protect, unsubscribe);

export default router;