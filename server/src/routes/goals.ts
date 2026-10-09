import { Router } from 'express';
import { z } from 'zod';
import { contributionBody, createGoalBodyV2, objectId } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { contribute, createGoal, deleteGoal, getGoals } from '../controllers/goalController.js';

const router = Router();
const idParam = validate('params', z.object({ id: objectId }));

router.get('/', getGoals);
router.post('/', validate('body', createGoalBodyV2), createGoal);
router.post('/:id/contribute', idParam, validate('body', contributionBody), contribute);
router.delete('/:id', idParam, deleteGoal);
export default router;