import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/:accountId', getMessages);
router.post('/:accountId', sendMessage);

export default router;