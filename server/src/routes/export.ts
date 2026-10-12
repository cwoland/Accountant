import { Router } from 'express';
import { exportQuery } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { exportCsv } from '../controllers/exportController.js';

const router = Router();

router.get('/csv', validate('query', exportQuery), exportCsv);

export default router;
