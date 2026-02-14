import { Request, Response, NextFunction } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    changeUserRole,
    getUserStats
} from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";


/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination)
 * @access  Private + admin
 */
const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            page,
            limit,
            role,
            isActive,
            isBanned,
            search,
            sortBy,
            sortOrder
        } = req.query;

        const result = await getAllUsers({
            page: page ? parseInt(page as string): undefined,
            limit: limit ? parseInt(limit as string): undefined,
            role: role as string,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            isBanned: isBanned === 'true' ? true : isBanned === 'false' ? false : undefined,
            search: search as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as 'asc' | 'desc'

        });

        res.status(200).json({
            success: true,
            data: result.users,
            pagination: result.pagination
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get a particular user by id
 * @access  Private + admin
 */
const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await getUserById(id as string);

        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private + admin
 */
const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await updateUser(id as string, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private + admin
 */
const removeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      throw new AppError('Not authenticated', 401);
    }

    await deleteUser(id as string, requestingUserId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/:id/ban
 * @desc    Ban a particular user
 * @access  Private + admin
 */
const banUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const bannedByUserId = req.user?.id;

    if (!bannedByUserId) {
      throw new AppError('Not authenticated', 401);
    }

    if (!reason) {
      throw new AppError('Ban reason is required', 400);
    }

    const user = await banUser(id as string, reason, bannedByUserId);

    res.status(200).json({
      success: true,
      message: 'User banned successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/:id/unban
 * @desc    Unban a particular user
 * @access  Private + admin
 */
const unbanUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await unbanUser(id as string);

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @route   PATCH /api/users/:id/role
 * @desc    Change a particular user's role
 * @access  Private + admin
 */
const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      throw new AppError('Not authenticated', 401);
    }

    if (!role) {
      throw new AppError('Role is required', 400);
    }

    const user = await changeUserRole(id as string, role, requestingUserId);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/stats
 * @desc    Get users statistics
 * @access  Private + admin
 */
const getStatistics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getUserStats();

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    next(error);
  }
};


export {
  getUsers,
  getUser,
  updateUserProfile,
  removeUser,
  banUserAccount,
  unbanUserAccount,
  updateUserRole,
  getStatistics
};