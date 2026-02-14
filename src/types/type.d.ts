import mongoose, { Document } from "mongoose";
export interface CustomError extends Error {
    statusCode?: number;
};

export interface RegisterBody {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

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


// Interface for refresh token subdocument
export interface IRefreshToken {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
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

export interface LoginData {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
}

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

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface LogoutBody {
  refreshToken: string;
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

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  targetUser?: mongoose.Types.ObjectId;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Activity action types
export type ActivityAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_reset'
  | 'email_verified'
  | 'profile_updated'
  | 'user_banned'
  | 'user_unbanned'
  | 'role_changed'
  | 'user_deleted';

// Interface for creating activity log
export interface CreateActivityParams {
  userId: string;
  action: ActivityAction;
  targetUserId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Interface for querying activity logs
export interface GetActivitiesQuery {
  userId?: string;
  action?: ActivityAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}