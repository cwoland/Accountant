import { Router } from 'express';
import { aiAskBody, categorizeBody } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { aiEnabled } from '../config/env.js';
import { serviceUnavailable } from '../lib/HttpError.js';
import { ask, categorize } from '../controllers/aiController.js';

const router = Router();

router.use((_req, _res, next) =>
  aiEnabled ? next() : next(serviceUnavailable('ИИ-советник не настроен')),
);

router.post('/ask', validate('body', aiAskBody), ask);
router.post('/categorize', validate('body', categorizeBody), categorize);

export default router;