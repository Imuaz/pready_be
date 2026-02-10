import express from "express";
import { register, login, logout } from "@controllers/auth.controller.js";
import validate from "@/middleware/validate.js";
import { registerValidator, loginValidator } from "@/validators/auth.validators.js";

const router = express.Router();


// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    validate(registerValidator),
    register
);

// @route   POST /api/auth/login
// @desc    Register a new user
// @access  Public
router.post(
    '/login',
    validate(loginValidator),
    login
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', logout);

export default router;