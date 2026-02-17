import bcrypt from "bcryptjs";
import User from "@/models/user.model.js";
import AppError from "@/utils/AppError.js";
import { logActivity } from "./activity.service.js";
import type {
  RegisterData,
  AuthResult,
  LoginData
} from "@/types/user.js";
import type {
  TokenPair,
  TokenPayload
} from "@/types/common.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  getTokenExpiry
} from "@/utils/jwt.js";
import {
  generateToken,
  hashToken,
  tokenExpiry
} from "@/utils/tokens.js";
import {
  sendVerificationEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail
} from "@/utils/email.js";


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

  // LOG ACITIVITY
  await logActivity({
    userId: (user._id as unknown as string).toString(),
    action: 'register',
    details: `New user registered: ${user.email}`
  });

  // Send verification email automatically
  try {
    await sendVerification((user._id as unknown as string).toString());
    console.log('📧 Verification email sent to:', user.email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    // Don't fail registration if email fails
    // User can request a new verification email later
  }

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
 * Login  user
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
    // LOG FAILED LOGIN ATTEMPT
  await logActivity({
    userId: (user._id as unknown as string),
    action: 'login',
    details: 'Failed login attempt - incorrect password',
    ipAddress,
    userAgent
  });

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

  // LOG SUCCESSFUl LOGIN
  await logActivity({
    userId: (user._id as unknown as string).toString(),
    action: 'login',
    details: 'Successful login',
    ipAddress,
    userAgent
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

  // LOG LOGOUT
  await logActivity({
    userId,
    action: 'logout',
    details: 'User logged out from device'
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

/**
 * Send verification email to user
 * @param userId - User's ID
 */
const sendVerification = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate verification token
  const verificationToken = generateToken();
  const hashedToken = hashToken(verificationToken);

  // Save hashed token and expiry to database
  const tokenExpire = tokenExpiry(
    parseInt(process.env.EMAIL_VERIFY_TOKEN_EXPIRE || '3600000', 10)
  );

  await User.findByIdAndUpdate(userId, {
    verificationToken: hashedToken,
    verificationTokenExpire: tokenExpire
  });

  // Send email with plain token (not hashed)
  await sendVerificationEmail(user.email, user.name, verificationToken);
};

/**
 * Verify email with token
 * @param token - Verification token from email
 */
const verifyEmail = async (token: string): Promise<void> => {
  // Hash the token to compare with DB
  const hashedToken = hashToken(token);

  // Find user with this token that hasn't expired
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() }
  }).select('+verificationToken +verificationTokenExpire');

  if (!user) {
    throw new AppError(
      'Invalid or expired verification token. Please request a new one.',
      400
    );
  }

  // Mark email as verified and remove token
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  // LOG EMAIL VERIFICATION
  await logActivity({
    userId: (user._id as unknown as string).toString(),
    action: 'email_verified',
    details: `Email address: ${user.email} verified successfully`
  });
};

/**
 * Send password reset email
 * @param email - User's email address
 */
const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email: email.toLowerCase() });

  // Security: Don't reveal if email exists or not
  // Same response for both cases
  if (!user) {
    // Still return success to prevent user enumeration
    return;
  }

  // Generate reset token
  const resetToken = generateToken();
  const hashedToken = hashToken(resetToken);

  // Save hashed token and expiry
  const tokenExpire = tokenExpiry(
    parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRE || '3600000', 10)
  );

  await User.findByIdAndUpdate(user._id, {
    resetPasswordToken: hashedToken,
    resetPasswordExpire: tokenExpire
  });

  // Send email
  await sendPasswordResetEmail(user.email, user.name, resetToken);
};

/**
 * Reset password with token
 * @param token - Reset token from email
 * @param newPassword - New password
 */
const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  // Hash token to compare with DB
  const hashedToken = hashToken(token);

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpire +password +refreshTokens');

  if (!user) {
    throw new AppError(
      'Invalid or expired reset token. Please request a new one.',
      400
    );
  }

  // Hash new password
  const saltRounds = parseInt(process.env.SALTROUNDS || '10', 10)
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password and clear reset token
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Clear all refresh tokens (logout from all devices for security)
  user.refreshTokens = [];

  await user.save();

  // LOG PASSWORD RESET
  await logActivity({
    userId: (user._id as unknown as string).toString(),
    action: 'password_reset',
    details: 'Password reset successfully via email link'
  });

  // Send confirmation email
  await sendPasswordChangedEmail(user.email, user.name);
};

// Export all new functions
export {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  logoutAllDevices,
  verifyPassword,
  sendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword
};