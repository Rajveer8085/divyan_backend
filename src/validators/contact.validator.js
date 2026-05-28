import { body } from 'express-validator';

export const contactRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name is too long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 6, max: 20 }).withMessage('Phone number looks invalid'),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 150 }).withMessage('Subject is too long'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters'),
];
