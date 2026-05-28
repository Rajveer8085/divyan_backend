import { body } from 'express-validator';

export const createEmployeeRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('role').trim().notEmpty().withMessage('Role is required').isLength({ max: 100 }),
  body('tag').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('quote').optional({ checkFalsy: true }).trim().isLength({ max: 400 }),
];

export const updateEmployeeRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }),
  body('role').optional().trim().notEmpty().withMessage('Role cannot be empty').isLength({ max: 100 }),
  body('tag').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('quote').optional({ checkFalsy: true }).trim().isLength({ max: 400 }),
];
