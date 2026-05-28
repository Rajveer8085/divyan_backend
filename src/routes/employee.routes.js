import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadPhoto } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createEmployeeRules, updateEmployeeRules } from '../validators/employee.validator.js';
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee.controller.js';

const router = Router();

// Public — used by the website's Team section.
router.get('/', listEmployees);

// Protected — admin only. multer runs first to parse multipart (file + fields).
router.post('/', requireAuth, uploadPhoto, createEmployeeRules, validate, createEmployee);
router.put('/:id', requireAuth, uploadPhoto, updateEmployeeRules, validate, updateEmployee);
router.delete('/:id', requireAuth, deleteEmployee);

export default router;
