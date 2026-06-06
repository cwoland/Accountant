import { Router } from 'express';
import {
    analyzeExpenses,
    getBudgetAdvice,
    categorizeTransaction,
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/analyze', analyzeExpenses);
router.post('/advice', getBudgetAdvice);
router.post('/categorize', categorizeTransaction);

export default router;