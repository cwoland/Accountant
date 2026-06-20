import { Router } from 'express';
import { getGoals, createGoal, contribute, deleteGoal } from '../controllers/goalController.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.post('/:id/contribute', contribute);
router.delete('/:id', deleteGoal);

export default router;