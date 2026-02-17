import { Request, Response, NextFunction } from "express";
import {
    getActivities,
    getUserRecentActivities,
    getActivityStats
} from "@/services/activity.service.js";
import AppError from "@/utils/AppError.js";


/**
 * Get all activities (admin only)
 */
const getAllActivities = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { userId, action, startDate, endDate, page, limit} = req.query;

        const result = await getActivities({
            userId: userId as string,
            action: action as any,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined
        });

        res.status(200).json({
            success: true,
            data: result.activities,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get current user's activities 
 */
const getMyActivities = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        const { limit } = req.query;

        const activities = await getUserRecentActivities(
            userId,
            limit ? parseInt(limit as string) : undefined
        );

        res.status(200).json({
            success: true,
            data: { activities }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get activity statistics (admin only)
 */
const getStats = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const stats = await getActivityStats();

        res.status(200).json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
}

export { getAllActivities, getMyActivities, getStats}