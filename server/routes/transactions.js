import { Router } from 'express';
import {
    getTransactions,
    getStats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from '../controllers/transactionController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;