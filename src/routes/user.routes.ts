import express, { Request, Response } from "express";
import type { UserProfile, UpdateProfileBody } from "@/types/type.d.ts";


const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', (_req: Request, res: Response) => {
    const profile: UserProfile = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
    };

    res.json({
        success: true,
        message: 'User profile endpoint',
        data: profile
    });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', (req: Request<{}, {}, UpdateProfileBody>, res: Response) => {
    res.json({
        success: true,
        message: 'Profile updated',
        data:req.body
    });
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', (_req: Request, res: Response) => {
    const users: UserProfile[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com'},
        { id: 2, name: 'Jane Smith', email: 'jane@example.com'}
    ];

    res.json({
        success: true,
        message: 'Get all users endpoint',
        data: users
    });
});

export default router;