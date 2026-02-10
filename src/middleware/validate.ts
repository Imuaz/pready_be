import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware that runs validation chains and returns errors if any
 * @param validations - Array of express-validator validation chains
 */
const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    for (const validation of validations) {
      await validation.run(req);
    }

    // Check if there are any validation errors
    const errors = validationResult(req);

    // If no errors, continue to next middleware
    if (errors.isEmpty()) {
      next();
      return;
    }

    // Format errors into clean array
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));

    // Return validation errors
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors
    });
  };
};

export default validate;