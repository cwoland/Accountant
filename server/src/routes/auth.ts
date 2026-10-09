import { Router } from 'express';
import {
  changePasswordBody,
  loginBody,
  registerBody,
  searchQuery,
  updateProfileBody,
} from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  changePassword,
  completeOnboarding,
  getMe,
  login,
  register,
  searchUsers,
  updateProfile,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', validate('body', registerBody), register);
router.post('/login', validate('body', loginBody), login);

router.get('/search', protect, validate('query', searchQuery), searchUsers);

router.get('/me', protect, getMe);
router.put('/profile', protect, validate('body', updateProfileBody), updateProfile);
router.put('/password', protect, validate('body', changePasswordBody), changePassword);
router.post('/onboarding-complete', protect, completeOnboarding);

export default router;