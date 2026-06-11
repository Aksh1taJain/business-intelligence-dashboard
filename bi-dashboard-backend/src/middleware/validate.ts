import { body, validationResult, type ValidationChain } from 'express-validator';
import type { RequestHandler } from 'express';
import { sendError } from '../utils/response';

/**
 * Run after a chain of express-validator checks.
 * If any errors exist, respond with 422 and formatted details.
 */
export const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(e => ({
      field: e.type === 'field' ? e.path : 'unknown',
      message: e.msg as string,
    }));
    sendError(res, 'Validation failed.', { status: 422, details });
    return;
  }
  next();
};

// ─── Reusable field validators ────────────────────────────────────────────────

export const registerValidators: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];

export const loginValidators: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];
