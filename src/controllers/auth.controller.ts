import { Request, Response, NextFunction } from "express";
import { registerUser } from "@/services/auth.service.js";
import type { RegisterRequestBody } from "@/types/type.js";
// import AppError from '../utils/AppError.js';


/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Call service to handle business logic
    const result = await registerUser({ name, email, password });

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          isEmailVerified: result.user.isEmailVerified,
          createdAt: result.user.createdAt
        }
      }
    });

  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user (placeholder for Lesson 5)
 * @access  Public
 */
const login = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Login coming in Lesson 5!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (placeholder for Lesson 7)
 * @access  Private
 */
const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Logout coming in Lesson 7!'
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, logout };