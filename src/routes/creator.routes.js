import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireCreatorAuth } from '../middleware/creatorAuth.js';
import {
  creatorSignupRules,
  creatorLoginRules,
  creatorProfileRules,
  creatorVettingRules,
} from '../validators/creator.validator.js';
import {
  signup,
  login,
  logout,
  me,
  updateProfile,
  listCreators,
  updateVetting,
  deleteCreator,
} from '../controllers/creator.controller.js';

// Throttle signup/login to slow down brute-force and spam account creation.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const router = Router();

// Public — creator-facing auth on the website.
router.post('/signup', authLimiter, creatorSignupRules, validate, signup);
router.post('/login', authLimiter, creatorLoginRules, validate, login);
router.post('/logout', logout);

// Creator — own session & profile.
router.get('/me', requireCreatorAuth, me);
router.put('/profile', requireCreatorAuth, creatorProfileRules, validate, updateProfile);

// Admin-only — signups appear here for the admin panel.
router.get('/', requireAuth, listCreators);
router.patch('/:id/vetting', requireAuth, creatorVettingRules, validate, updateVetting);
// Back-compat alias (same handler) for clients already using /status.
router.patch('/:id/status', requireAuth, creatorVettingRules, validate, updateVetting);
router.delete('/:id', requireAuth, deleteCreator);

export default router;
