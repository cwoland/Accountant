import { Router } from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { searchUsers, completeOnboarding } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/search', protect, searchUsers);
router.post('/onboarding-complete', protect, completeOnboarding);

export default router;