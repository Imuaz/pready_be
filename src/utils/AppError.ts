/**
 * Custom error class for application errors
 * Extends built-in Error class with statusCode
 */
class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    // Call parent Error constructor with message
    super(message);

    // Set custom properties
    this.statusCode = statusCode;

    // Operational errors are expected errors (not bugs)
    // e.g. "User not found", "Invalid password"
    this.isOperational = true;

    // Captures the stack trace properly
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;