import { Document } from "mongoose";
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