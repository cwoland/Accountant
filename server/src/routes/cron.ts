import { Router } from "express";
import { env } from "../config/env.js";
import { requireCronSecret } from "../middleware/auth.js";
import { materializeDue } from "../services/recurringService.js";
import { notifyMandatory, notifyMonthlyStats } from "../controllers/pushController.js";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(requireCronSecret(env.CRON_SECRET));

router.post('/recurring', async (_req, res, next) => {
    try {
        const result = await materializeDue();
        logger.info(result, 'cron: повторяющиеся платежи');
        res.json(result);
    } catch (err) { next(err); }
});

router.post('/notify-mandatory', notifyMandatory);
router.post('/notify-monthly', notifyMonthlyStats);

export default router;