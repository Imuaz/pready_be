/**
 * Common types used across the application
 */

// Custom error type
export interface CustomError extends Error {
    statusCode?: number;
}

// Token payload interface
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

// Token pair interface
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Interface for refresh token subdocument
export interface IRefreshToken {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Email transporter interface
export interface EmailConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

// Email options interface
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}
