import { body, param } from "express-validator";

// Validate API key creation
export const createApiKeyValidator = [
    body('name')
        .notEmpty()
        .withMessage('API key name is required')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Name must be between and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('permissions')
        .optional()
        .isArray()
        .withMessage('Permissions must be an array')
        .custom((permissions: string[]) => {
            const validPermissions = ['read', 'write', 'delete', 'admin'];
            const invalid = permissions.filter(p => !validPermissions.includes(p));
            if(invalid.length > 0) {
                throw new Error(`Invalid permissions: ${invalid.join(', ')}`); 
            }
            return true;
        }),
    
    body('rateLimit.requestsPerMinute')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Requests per minute must be between 1 and 1000'),
    
    body('rateLimit.requestsPerHour')
        .optional()
        .isInt({ min: 1, max: 100000 })
        .withMessage('Requests per hour must be between 1 and 100000'),

    body('rateLimit.requestsPerDay')
        .optional()
        .isInt({ min: 1, max: 1000000 })
        .withMessage('Requests per day must be between 1 and 1000000'),

    body('expiresInDays')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Expiry must be between 1 and 365 days'),

    body('allowedIps')
        .optional()
        .isArray()
        .withMessage('Allowed IPs must be an array'),
        
    body('allowedIps.*')
        .optional()
        .isIP()
        .withMessage('Invalid IP address format'),

    body('allowedDomains')
        .optional()
        .isArray()
        .withMessage('Allowed domains must be an array')
];

// Validate API key update
export const updateApiKeyValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid API key ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
    .custom((permissions: string[]) => {
      const validPermissions = ['read', 'write', 'delete', 'admin'];
      const invalid = permissions.filter(p => !validPermissions.includes(p));
      if (invalid.length > 0) {
        throw new Error(`Invalid permissions: ${invalid.join(', ')}`);
      }
      return true;
    })
];

// Validate API key ID parameter
export const apiKeyIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid API key ID')
];