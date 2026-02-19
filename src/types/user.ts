/**
 * User-related types
 */

import mongoose, { Document } from "mongoose";
import type { IRefreshToken, TokenPair } from "./common.js";

// Define the User interface for TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshTokens: IRefreshToken[];
  lastLogin?: Date;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  bannedBy?: mongoose.Types.ObjectId;
  bannedAt?: Date;
  profileImage?: string;
  bio?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Register request body
export interface RegisterBody {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Login request body
export interface LoginBody {
    email: string;
    password: string;
}

// User profile interface
export interface UserProfile {
    id: number;
    name: string;
    email: string;
}

// Update profile request body
export interface UpdateProfileBody {
    name?: string;
    email?: string;
}

// Interface for registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Interface for the registration result
export interface RegisterResult {
  user: Omit<IUser, 'password'>;
}

// Interface for register request body
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Login data interface
export interface LoginData {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
}

// Auth result interface
export interface AuthResult {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        isEmailVerified: boolean;
    };
    tokens: TokenPair;
}

// Refresh token request body
export interface RefreshTokenBody {
  refreshToken: string;
}

// Logout request body
export interface LogoutBody {
  refreshToken: string;
}

// Get users query parameters
export interface GetUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  isBanned?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Update user data
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  bio?: string;
  phone?: string;
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

// User statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  usersByRole: {
    user: number;
    moderator: number;
    admin: number;
  };
}


