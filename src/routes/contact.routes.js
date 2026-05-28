import { Router } from 'express';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { contactRules } from '../validators/contact.validator.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  submitContact,
  listContacts,
  deleteContact,
  updateContact,
} from '../controllers/contact.controller.js';

const router = Router();

// Public submission
router.post('/', contactLimiter, contactRules, validate, submitContact);

// Admin-only management
router.get('/', requireAuth, listContacts);
router.patch('/:id', requireAuth, updateContact);
router.delete('/:id', requireAuth, deleteContact);

export default router;
