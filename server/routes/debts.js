import { Router } from 'express';
import { getDebts, createDebt, addPayment, deleteDebt } from '../controllers/debtController.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', getDebts);
router.post('/', createDebt);
router.post('/:id/payment', addPayment);
router.delete('/:id', deleteDebt);

export default router;