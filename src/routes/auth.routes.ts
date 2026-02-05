import express, { Request, Response } from "express";
import type { RegisterBody, LoginBody } from "@/types/type.d.ts"

const router = express.Router();


// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', (req: Request<{}, {}, RegisterBody>, res: Response) => {
    // Now req.body is typed as ResgisterBody
    const { email, name } = req.body;

    res.json({
        success: true,
        message: 'Register Successfully',
        data: { email, name } // password shouldnit be returned
    });
});

// @route   POST /api/auth/login
// @desc    Register a new user
// @access  Public
router.post('/login', (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email } = req.body;

    res.json({
        success: true,
        message: 'Login Successful',
        data: { email}
    });
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Logout successfully'
    });
});

export default router;