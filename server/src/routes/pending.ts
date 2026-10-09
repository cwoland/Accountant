import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { getPending, pendingQuery } from '../controllers/pendingController.js';

const router = Router();
router.get('/', validate('query', pendingQuery), getPending);
export default router;