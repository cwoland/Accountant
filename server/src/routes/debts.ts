import { Router } from 'express';
import { z } from 'zod';
import { contributionBody, createDebtBody, objectId } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { addPayment, createDebt, deleteDebt, getDebts } from '../controllers/debtController.js';

const router = Router();
const idParam = validate('params', z.object({ id: objectId }));

router.get('/', getDebts);
router.post('/', validate('body', createDebtBody), createDebt);
router.post('/:id/payment', idParam, validate('body', contributionBody), addPayment);
router.delete('/:id', idParam, deleteDebt);
export default router;