import crypto from 'crypto';

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes (default 32)
 * @returns Hex string token
 */
const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a token for storage
 * @param token - Plain text token
 * @returns Hashed token
 */
const hashToken = (token: string): string => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Calculate token expiry time
 * @param milliseconds - Time until expiry in ms
 * @returns Date object for expiry
 */
const getTokenExpiry = (milliseconds: number): Date => {
  return new Date(Date.now() + milliseconds);
};

export { generateToken, hashToken, getTokenExpiry };
