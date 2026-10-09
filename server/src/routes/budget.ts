import { Router } from 'express';
import { budgetQuery, setBudgetBody } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { getBudget, setBudget } from '../controllers/budgetController.js';

const router = Router();
router.get('/', validate('query', budgetQuery), getBudget);
router.post('/', validate('body', setBudgetBody), setBudget);
export default router;