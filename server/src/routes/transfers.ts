import { Router } from 'express';
import { z } from 'zod';
import { createTransferBody, objectId } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { createTransfer, deleteTransfer } from '../controllers/transferController.js';

const router = Router();

router.post('/', validate('body', createTransferBody), createTransfer);
router.delete('/:id', validate('params', z.object({ id: objectId })), deleteTransfer);

export default router;
