import express, { Request, Response } from "express";
// import type { UserProfile, UpdateProfileBody } from "@/types/type.d.ts";
import { protect, authorize, requireVerified } from "@/middleware/auth.js";


const router = express.Router();

// @route   GET /api/users/health
// @access  Public
router.get('/health', (_req: Request, res: Response): void => {
    res.json({
        success:true,
        message: 'Users service is runnign'
    });
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, (req: Request, res: Response): void => {
    res.json({
        success: true,
        data: { user: req.user }
    });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, (req: Request, res: Response): void => {
    res.json({
        success: true,
        message: 'TD: Profile updated',
        data:req.body
    });
});

// @route   GET /api/users/verified-only
// @access  Private + Email Verified
router.get(
  '/verified-only',
  protect,
  requireVerified,
  (_req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'You have a verified email! Access granted.',
      data: { user: _req.user }
    });
  }
);

// @route   DELETE /api/users/:id
// @access  Private + Admin
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  (req: Request, res: Response): void => {
    res.json({
      success: true,
      message: `Delete user ${req.params.id} - coming in future`
    });
  }
);

// @route   GET /api/users/admin-or-mod
// @access  Private + Admin or Moderator
router.get(
  '/admin-or-mod',
  protect,
  authorize('admin', 'moderator'),
  (_req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'Admin or Moderator access granted',
      data: { user: _req.user }
    });
  }
);


// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), (_req: Request, res: Response): void => {
    res.json({
        success: true,
        message: 'Admin access granted - user list coming with DB',
        data:[]
    });
});

export default router;