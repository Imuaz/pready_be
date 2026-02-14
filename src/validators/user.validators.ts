import { body, query, param } from "express-validator";

// Validate user ID parameter
export const userIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

// Validate user update
export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Invalid role. Must be user, moderator, or admin')
];

// Validate ban user
export const banUserValidator = [
  body('reason')
    .notEmpty()
    .withMessage('Ban reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Ban reason must be between 10 and 500 characters')
];

// Validate role change
export const changeRoleValidator = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Invalid role. Must be user, moderator, or admin')
];

// Validate query parameters for get users
export const getUsersQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('role')
    .optional()
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Invalid role filter'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be true or false'),

  query('isBanned')
    .optional()
    .isBoolean()
    .withMessage('isBanned must be true or false'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'email', 'lastLogin'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];