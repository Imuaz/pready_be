import express from "express";
import {
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
} from "@controllers/auth.controller.js";
import validate from "@/middleware/validate.js";
import { protect } from "@/middleware/auth.js";
import {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} from "@/validators/auth.validators.js";

const router = express.Router();


// @route   POST /api/auth/register
// @access  Public
router.post(
    '/register',
    validate(registerValidator),
    register
);

// @route   POST /api/auth/login
// @access  Public
router.post(
    '/login',
    validate(loginValidator),
    login
);
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', refreshToken);

// @route   GET /api/auth/verify-email
// @access  Public
router.get('/verify-email', verifyUserEmail);

// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  '/forgot-password',
  validate(forgotPasswordValidator),
  forgotUserPassword
);

// @route POST /api/auth/reset-password
// @access Public
router.post(
    '/reset-password',
    validate(resetPasswordValidator),
    resetUserPassword
);

// @route POST /api/auth/send-verification
// @access Private
router.post(
    '/send-verification',
    protect,
    sendVerificationEmail
);

// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logout);

// @route   POST /api/auth/logout-all
// @access  Private
router.post('/logout-all', protect, logoutAll);

// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

export default router;