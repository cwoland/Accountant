import { Router } from 'express';
import { z } from 'zod';
import { listMessagesQuery, objectId, sendMessageBody } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';

const router = Router();
const accountParam = validate('params', z.object({ accountId: objectId }));

router.get('/:accountId', accountParam, validate('query', listMessagesQuery), getMessages);
router.post('/:accountId', accountParam, validate('body', sendMessageBody), sendMessage);

export default router;