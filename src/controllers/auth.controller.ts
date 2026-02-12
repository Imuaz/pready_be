import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  logoutAllDevices,
  sendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword
} from "@/services/auth.service.js";
import type {
  RegisterBody,
  LoginBody,
  RefreshTokenBody,
  LogoutBody
} from "@/types/type.js";
import AppError from "@/utils/AppError.js";


/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: result.user,
        tokens: result.tokens
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Extract request metadata
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await loginUser({
      email,
      password,
      ipAddress,
      userAgent
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: result.user,
        tokens: result.tokens
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh token
 * @access  Public
 */
const refreshToken = async (
  req: Request<{}, {}, RefreshTokenBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    const tokens = await refreshUserToken(token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = async (
  req: Request<{}, {}, LogoutBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    // req.user comes from auth middleware 
    // For now use token to identify user
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    await logoutUser(userId, token);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logoutall
 * @desc    logout all devices
 * @access  Private
 */
const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    await logoutAllDevices(userId);

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    res.status(200).json({
      success: true,
      data: { user: req.user }
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @route   POST /api/auth/send-verification
 * @desc    Send a verification email to user
 * @access  Private
 */
const sendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    await sendVerification(userId);

    res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
const verifyUserEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new AppError('Verification token is required', 400);
    }

    await verifyEmail(token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now access all features.'
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot user password
 * @access  Public
 */
const forgotUserPassword = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    await forgotPassword(email);

    // Always return success (security: don't reveal if email exists)
    res.status(200).json({
      success: true,
      message: 'If that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password
 * @access  Public
 */
const resetUserPassword = async (
  req: Request<{}, {}, { password: string; confirmPassword: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || typeof token !== 'string') {
      throw new AppError('Reset token is required', 400);
    }

    await resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! Please login with your new password.'
    });

  } catch (error) {
    next(error);
  }
};

// Export all functions
export {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  sendVerificationEmail,
  verifyUserEmail,
  forgotUserPassword,
  resetUserPassword
};