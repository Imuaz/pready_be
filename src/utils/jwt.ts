import jwt from "jsonwebtoken";
import AppError from "./AppError.js";
import type { TokenPayload, TokenPair } from "@/types/common.js";


/**
 * Generate an access token
 * @param payload - Data to encode in token
 * @returns Signed JWT access token
 */
const generateAccessToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    const expire = process.env.JWT_EXPIRE || '7d';

    if (!secret) {
        throw new AppError('JWT_SECRET is not defined', 500);
    }

    return jwt.sign(payload, secret, {
        expiresIn: expire as jwt.SignOptions['expiresIn']
    });
};

/**
 * Generate a refresh token
 * @param payload - Data to encode in the token
 * @returns Signed JWT refresh token
 */
const generateRefreshToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_REFRESH_SECRET;
    const expire = process.env.JWT_REFRESH_EXPIRE || '30d';

    if (!secret) {
        throw new AppError('JWT_REFRESH_SECRET is not defined', 500)
    }

    return jwt.sign(payload, secret, {
        expiresIn: expire as jwt.SignOptions['expiresIn']
    });
};

/**
 * Generate both access and refresh tokens
 * @param payload - Data to encode
 * @returns Object with both tokens
 */
const generateTokenPair = (payload: TokenPayload): TokenPair => {
    return{
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};

/**
 * Verify an access token
 * @param token - JWT token to verify
 * @returns Decoded payload
 */
const verifyAccessToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError('JWT_SECRET is not defined', 500);
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Access token has expired', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid access token', 401);
    }
    throw new AppError('Token verification failed', 401);
  }
};

/**
 * Verify a refresh token
 * @param token - Refresh token to verify
 * @returns Decoded payload
 */
const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new AppError('JWT_REFRESH_SECRET is not defined', 500);
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token has expired. Please login again', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid refresh token', 401);
    }
    throw new AppError('Token verification failed', 401);
  }
};

/**
 * Calculate expiry date from duration string
 * @param duration - Duration string like '30d', '7d', '1h'
 * @returns Date object for expiry
 */
const getTokenExpiry = (duration: string): Date => {
  const now = new Date();

  // Parse duration string
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);

  switch (unit) {
    case 'd':
      now.setDate(now.getDate() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    default:
      now.setDate(now.getDate() + 30); // Default 30 days
  }

  return now;
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpiry
};
