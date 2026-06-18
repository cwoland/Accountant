import {Router } from 'express';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/search', async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2)
            return res.json([]);

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
            _id: { $ne: req.user._id },
        }).select('name email avatar').limit(5);

        res.json(users);
    } catch (err) { next(err); }
});

export default router;