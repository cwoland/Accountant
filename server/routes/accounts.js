import { Router } from 'express';
import {
    getAccounts,
    getInvites,
    createAccount,
    acceptInvite,
    declineInvite,
    leaveAccount,
    deleteAccount,
    getAccountStats,
} from '../controllers/accountController.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/',             getAccounts);
router.get('/invites',      getInvites);
router.post('/',            createAccount);
router.post('/:id/accept',  acceptInvite);
router.post('/:id/decline', declineInvite);
router.delete('/:id/leave', leaveAccount);
router.delete('/:id',       deleteAccount);
router.get('/:id/stats',    getAccountStats);

export default router;