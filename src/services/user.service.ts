import mongoose from "mongoose";
import User from "@/models/user.model.js";
import Activity from "@/models/activity.model.js";
import type {
    GetUsersQuery,
    UpdateUserData,
    UserStats
} from "@/types/type.js";
import AppError from "@/utils/AppError.js";


/**
 * Get all users with pagination and filters
 * @param query - Query parameter
 * @returns Any users object with paginations
 */
const getAllUsers = async (query: GetUsersQuery) => {
    const {
        page = 1,
        limit = 10,
        role,
        isActive,
        isBanned,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = query

    // Build filter object
    const filter: any = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (isBanned !== undefined) filter.isBanned = isBanned;

    // Search by name or email
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Calculate skip
    const skip = (page -1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Excute query
    const users = await User.find(filter).select('-password -refreshTokens -verificationToken -resetPasswordToken').sort(sort).skip(skip).limit(limit).lean();

    // Get total count
    const total = await User.countDocuments(filter);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get user by id
 * @param userId- Target user id
 * @returns Any user
 */
const getUserById = async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
    }

    const user = await User.findById(userId).select('-password -refreshTokens -verificationToken -resetPasswordToken').populate('bannedBy', 'name email').lean();

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

/**
 * Update a particular user data
 * @param userId - Target user id
 * @param updateData - user data to be updated
 * @returns Any updated user
 */
const updateUser = async (
    userId: string,
    updateData: UpdateUserData,
) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // If changing email, check it's not taken
    if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({
            email: updateData.email.toLowerCase()
        });

        if (emailExists) {
            throw new AppError('Email already in use', 409);
        }

        updateData.email = updateData.email?.toLowerCase();
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    return user;
}

/**
 * Delete a particular user
 * @param userId - user to be deleted id
 * @param requestingUserId - user performing the delete action
 */
const deleteUser = async (userId: string, requestingUserId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid use ID format', 400);
    }

    // Prevent self-deletion
    if (userId === requestingUserId) {
        throw new AppError('You cannot delete your own account', 403);
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    await User.findByIdAndDelete(userId);

    return { message: 'User deleted successfully'};
}

/**
 * Ban a particular user
 * @param userId - user to be banned id
 * @param reason - Reason for the ban
 * @param bannedByUserId - user performing the ban action
 */
const banUser = async (
    userId: string,
    reason: string,
    bannedByUserId: string
) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
    }

    // Prevent self-ban
    if (userId === bannedByUserId) {
        throw new AppError('You cannot ban yourself', 403);
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.isBanned) {
        throw new AppError('User is already banned', 400);
    }

    // Prevent banning admins (unless super admin is implemented)
    if (user.role === 'admin') {
        throw new AppError('Cannont ban admin users', 403)
    }

    user.isBanned = true;
    user.banReason = reason;
    user.bannedBy = new mongoose.Types.ObjectId(bannedByUserId);
    user.bannedAt = new Date();

    await Activity.create({
      user: bannedByUserId,
      action: 'user_banned',
      targetUser: userId,
      details: reason
    });

    // Clear all refresh tokens (force logout)
    user.refreshTokens = [];
    await user.save();

    return user;
}

/**
 * Unban a particular user
 * @param userId - user to be unbanned id
 */
const unbanUser = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID format', 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isBanned) {
    throw new AppError('User is not banned', 400);
  }

  user.isBanned = false;
  user.banReason = undefined;
  user.bannedBy = undefined;
  user.bannedAt = undefined;

  await user.save();

  return user;
};

/**
 * Change user role
 * @param userId - user who's role to bechanged
 * @param newRole- New role to change to
 * @param requestingUserId - user performing the role change
 */
const changeUserRole = async (
  userId: string,
  newRole: string,
  requestingUserId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID format', 400);
  }

  // Prevent changing own role
  if (userId === requestingUserId) {
    throw new AppError('You cannot change your own role', 403);
  }

  const validRoles = ['user', 'moderator', 'admin'];
  if (!validRoles.includes(newRole)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.role = newRole as 'user' | 'admin' | 'moderator';
  await user.save();

  return user;
};

/**
 * Get all user statistics
 */
const getUserStats = async (): Promise<UserStats> => {
  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    verifiedUsers,
    roleStats
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true, isBanned: false }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ isEmailVerified: true }),
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Transform role stats into object
  const usersByRole = {
    user: 0,
    moderator: 0,
    admin: 0
  };

  roleStats.forEach(stat => {
    usersByRole[stat._id as keyof typeof usersByRole] = stat.count;
  });

  return {
    totalUsers,
    activeUsers,
    bannedUsers,
    verifiedUsers,
    usersByRole
  };
};


export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  changeUserRole,
  getUserStats
};