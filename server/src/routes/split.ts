import { Router } from 'express';
import { z } from 'zod';
import { objectId, splitBody } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { clearSplit, getSettlement, setSplit } from '../controllers/splitController.js';

const router = Router();
const idParam = validate('params', z.object({ id: objectId }));

router.put('/transaction/:id', idParam, validate('body', splitBody), setSplit);
router.delete('/transaction/:id', idParam, clearSplit);
router.get(
  '/account/:accountId',
  validate('params', z.object({ accountId: objectId })),
  getSettlement,
);

export default router;
