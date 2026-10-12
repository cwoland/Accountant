import { Router } from 'express';
import { categoryBudgetQuery, setCategoryBudgetsBody } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import {
  getCategoryBudgets,
  setCategoryBudgets,
} from '../controllers/categoryBudgetController.js';

const router = Router();

router.get('/', validate('query', categoryBudgetQuery), getCategoryBudgets);
router.post('/', validate('body', setCategoryBudgetsBody), setCategoryBudgets);

export default router;
