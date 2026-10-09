import { Router } from 'express';
import { z } from 'zod';
import { createAccountBody, objectId } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import {
  acceptInvite,
  archiveAccount,
  createAccount,
  declineInvite,
  getAccountStats,
  getAccounts,
  getInvites,
  leaveAccount,
  purgeAccount,
} from '../controllers/accountController.js';

const router = Router();
const idParam = validate('params', z.object({ id: objectId }));

router.get('/', getAccounts);
router.get('/invites', getInvites);
router.post('/', validate('body', createAccountBody), createAccount);

router.post('/:id/accept', idParam, acceptInvite);
router.post('/:id/decline', idParam, declineInvite);
router.post('/:id/leave', idParam, leaveAccount);

router.get('/:id/stats', idParam, getAccountStats);
router.post('/:id/archive', idParam, archiveAccount);
router.delete('/:id', idParam, purgeAccount);

export default router;