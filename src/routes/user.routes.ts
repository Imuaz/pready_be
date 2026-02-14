import express, { Request, Response } from "express";
import validate from "@/middleware/validate.js";
import {
  protect,
  authorize,
  requireVerified,
  preventSelfRoleChange
} from "@/middleware/auth.js";
import {
  getUsers,
  getUser,
  updateUserProfile,
  removeUser,
  banUserAccount,
  unbanUserAccount,
  updateUserRole,
  getStatistics
} from "@/controllers/user.controller.js";
import {
  userIdValidator,
  updateUserValidator,
  banUserValidator,
  changeRoleValidator,
  getUsersQueryValidator
} from "@/validators/user.validators.js";


const router = express.Router();

// @route GET /api/users/stats
// @desc Get user statistics
// @access Private + Admin
router.get(
  '/stats',
  protect,
  authorize('admin'),
  getStatistics
);

// @route GET /api/users
// @desc Get all users
// @access Private + Admin
router.get(
  '/',
  protect,
  authorize('admin'),
  validate(getUsersQueryValidator),
  getUsers
);

// @route GET /api/users/:id
// @desc Get a specific user
// @access Private + Admin
router.get(
  '/:id',
  protect,
  authorize('admin'),
  validate(userIdValidator),
  getUser
);

// @route PUT /api/users/:id
// @desc Update user profile
// @access Privatae + Admin
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate([...userIdValidator, ...updateUserValidator]),
  updateUserProfile
);

// @route DELETE /api/users/:id
// @desc Remove a user
// @access Private + Admin
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(userIdValidator),
  removeUser
);

// @route POST /api/users/:id/ban
// @desc Ban a user account
// @access Private + Admin
router.post(
  '/:id/ban',
  protect,
  authorize('admin'),
  validate([...userIdValidator, ...banUserValidator]),
  banUserAccount
);

// @route POST /api/users/:id/unban
// @desc Unban a user account
// @access Private + Admin
router.post(
  '/:id/unban',
  protect,
  authorize('admin'),
  validate(userIdValidator),
  unbanUserAccount
);

// @route PATCH /api/users/:id/role
// @desc Update user role
// @access Private + Admin
router.patch(
  '/:id/role',
  protect,
  authorize('admin'),
  preventSelfRoleChange,
  validate([...userIdValidator, ...changeRoleValidator]),
  updateUserRole
);
// @route GET /api/users/health
// @desc Health check for users service
// @access Public
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

// @route GET /api/users/verified-only
// @desc Verify email access endpoint
// @access Private + Email Verified
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

// @route GET /api/users/admin-or-mod
// @desc Admin or moderator access endpoint
// @access Private + Admin or Moderator
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


export default router;