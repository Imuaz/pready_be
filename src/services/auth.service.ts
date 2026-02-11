import bcrypt from "bcryptjs";
import User from "@/models/user.model.js";
import AppError from "@/utils/AppError.js";
import type {
  RegisterData,
  TokenPair,
  AuthResult,
  TokenPayload,
  LoginData
} from "@/types/type.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  getTokenExpiry
} from "@/utils/jwt.js";


/**
 * Register a new user
 * @param data - Registration data
 * @returns Created user data (without password)
 */
const registerUser = async (data: RegisterData): Promise<AuthResult> => {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Hash the password
  const hashedPassword: string = await bcrypt.hash(password, parseInt(process.env.SALTROUNDS || '10', 10));

  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  // Generate token pair
  const tokenPayload: TokenPayload = {
    id: (user._id as unknown as string).toString(),
    email: user.email,
    role: user.role
  };

  const tokens = generateTokenPair(tokenPayload);

  // Store refresh token in database
  const refreshExpiry = getTokenExpiry(
    process.env.JWT_REFRESH_EXPIRE || '30d'
  );

  // Select refreshTokens field explicitly (it has select: false)
  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: tokens.refreshToken,
        expiresAt: refreshExpiry
      }
    }
  });

  return {
    user: {
      id: (user._id as unknown as string).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    },
    tokens
  };
};

/**
 * Verify a password against its hash
 * @param plainPassword - Password to verify
 * @param hashedPassword - Hash to verify against
 * @returns Boolean indicating match
 */
const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Log user in
 * @param data - User data
 * @returns an authenticated user
 */
const loginUser = async (data: LoginData): Promise<AuthResult> => {
  const { email, password, ipAddress, userAgent } = data;

  // Find user WITH password (select: false means we need to expicitly request it)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');

  // Check if user exists
  // NOTE: We use same error message for wrong email AND wrong password
  // This prevents "user enumeration attacks" - attackers can't tell
  // if email exists or password {is wrong
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid){
    throw new AppError('Invalid email or password', 401);
  }
  
  // Generate new token pair
  const tokenPayload: TokenPayload = {
    id: (user._id as unknown as string).toString(),
    email: user.email,
    role: user.role
  };

  const tokens = generateTokenPair(tokenPayload);

  // Store refresh token & update last login
  const refreshExpiry = getTokenExpiry(
    process.env.JWT_REFRESH_EXPIRE || '30d'
  );

  // Clean up expired tokens while adding new one
  const now = new Date();
  await User.findByIdAndUpdate(user._id, {
    // Remove expired refresh tokens
    $push: {
      refreshTokens: {
        token: tokens.refreshToken,
        expiresAt: refreshExpiry,
        ipAddress,
        userAgent
      }
    },
    // Update last login
    lastLogin: now
  });

  return {
    user: {
      id: (user._id as unknown as string).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    },
    tokens
  };
  }

  /**
 * Refresh a tokon
 * @param refreshToken - Token to refresh
 * @returns Token pair
 */
const refreshUserToken = async (refreshToken: string): Promise<TokenPair> => {
  // Verify the refresh token is valid JWT
  const decoded = verifyRefreshToken(refreshToken);

  // Find user with this refresh token in DB
  const user = await User.findById(decoded.id).select('+refreshTokens');

  if (!user) {
    throw new AppError('User not found', 401);
  }

  // Check if this refresh token exists in DB
  // This is important! Even if JWT is valid, if we deleted it (logout),
  // it should not work
  const tokenExists = user.refreshTokens.some(
    (rt) => rt.token === refreshToken && rt.expiresAt > new Date()
  );

  if (!tokenExists) {
    throw new AppError('Invalid or expired refresh token. Please login again', 401);
  }

  // Generate new token pair
  const tokenPayload: TokenPayload = {
    id: (user._id as unknown as string).toString(),
    email: user.email,
    role: user.role
  };

  const tokens = generateTokenPair(tokenPayload);

  // Replace old refresh token with new one (rotation)
  // This means each refresh token can only be used ONCE
  const refreshExpiry = getTokenExpiry(
    process.env.JWT_REFRESH_EXPIRE || '30d'
  );

  await User.findByIdAndUpdate(user._id, {
    $pull: { refreshTokens: { token: refreshToken } }
  });

  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: tokens.refreshToken,
        expiresAt: refreshExpiry
      }
    }
  });

  return tokens;
};

/**
 * Logout single user's device
 * @param usderId - user id
 * @param refreshToken - refresh token to logout
 */
const logoutUser = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  // Remove only this device's refresh token
  await User.findByIdAndUpdate(userId, {
    $pull: {refreshTokens: {token: refreshToken }}
  });
};

/**
 * Logout all user's devices
 * @param usderId - user id
 */
const logoutAllDevices = async (userId: string): Promise<void> => {
  // Remove ALL refresh tokens = logout from all devices
  await User.findByIdAndUpdate(userId, {
    $set: { refreshTokens: [] }
  });
};

export {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  logoutAllDevices,
  verifyPassword
};