import { Router } from 'express';
import {
    subscribe, unsubscribe, getVapidKey,
    notifyMandatory, notifyMonthlyStats,
} from '../controllers/pushController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/vapid-key', protect, getVapidKey);
router.post('/subscribe', protect, subscribe);
router.delete('/subscribe', protect, unsubscribe);
router.post('/notify-mandatory', notifyMandatory);
router.post('/notify-monthly', notifyMonthlyStats);

export default router;