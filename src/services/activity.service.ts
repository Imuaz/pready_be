import mongoose from "mongoose";
import Activity from "@/models/activity.model.js";
import type {
    CreateActivityParams,
    GetActivitiesQuery
} from "@/types/activity.js";


/**
 * Log an activity
 * @param params - Activity parameters
 */
const logActivity = async (params: CreateActivityParams): Promise<void> => {
    try {
        const {
            userId,
            action,
            targetUserId,
            details,
            ipAddress,
            userAgent
        } = params;

        await Activity.create({
            user: new mongoose.Types.ObjectId(userId),
            action,
            targetUser: targetUserId ? new mongoose.Types.ObjectId(targetUserId) : undefined,
            details,
            ipAddress,
            userAgent
        });

        console.log(`📝 Activity logged: ${action} by user ${userId}`);
    } catch (error) {
        // Don't throw error - logging failure shouldn't break the app
        console.error('❌ Failed to log activity:', error);
    }
};

/**
 * Get activities with filters
 * @param query - Filter parameters
 */
const getActivities = async (query: GetActivitiesQuery) => {
    const {
        userId,
        action,
        startDate,
        endDate,
        page = 1,
        limit = 50
    } = query;

    // Build filter
    const filter: any = {};

    if (userId) {
        filter.user = new mongoose.Types.ObjectId(userId);
    }

    if (action) {
        filter.action = action;
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
    }

    // Execute query
    const skip = (page -1) * limit;

    const [activities, total] = await Promise.all([
        Activity.find(filter)
            .populate('user', 'name email')
            .populate('targetUser', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Activity.countDocuments(filter)
    ]);

    return {
        activities,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get user's recent activities
 * @param userId - User ID
 * @param limit - Number of activities to return
 */
const getUserRecentActivities = async (
    userId: string,
    limit: number = 10
) => {
    const activities = await Activity.find({
        user: new mongoose.Types.ObjectId(userId)
    })
        .populate('targetUser', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    
    return activities
};

/**
 * Get activity statistics
 */
const getActivityStats = async () => {
    const stats = await Activity.aggregate([
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    // Get recent activity count (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await Activity.countDocuments({
        createdAt: { $gte: yesterday }
    });

    return {
        byAction: stats,
        last24Hours: recentCount
    };
};

/**
 * Delete old activity logs (cleanup)
 * @param daysToKeep - Number of days to keep logs
 */
const cleanupOldActivities = async (daysToKeep: number = 90) => {
    const cutoffDate = new Date(
        Date.now() - daysToKeep * 24 * 60 * 60 * 1000
    );

    const result = await Activity.deleteMany({
        createdAt: { $lt: cutoffDate }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old activity logs`);

    return result.deletedCount;
};

export {
    logActivity,
    getActivities,
    getUserRecentActivities,
    getActivityStats,
    cleanupOldActivities
};
