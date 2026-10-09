import { Router } from 'express';
import {
    createTransactionBody,
    listTransactionsQuery,
    objectId,
    statsQuery,
    updateTransactionBody,
} from '@accountant/shared';
import { z } from 'zod';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { 
    createTransaction,
    deleteTransaction,
    getStats,
    getTransactions,
    updateTransaction,
} from '../controllers/transactionController.js';

const router = Router();
const idParam = validate('params', z.object({ id: objectId }));

router.use(protect);

router.get('/stats', validate('query', statsQuery), getStats);
router.get('/', validate('query', listTransactionsQuery), getTransactions);
router.post('/', validate('body', createTransactionBody), createTransaction);
router.put('/:id', idParam, validate('body', updateTransactionBody), updateTransaction);
router.delete('/:id', idParam, deleteTransaction);

export default router;