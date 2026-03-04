import { Request, Response, NextFunction } from "express";
import {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getPreferences,
    updatePreferences,
    getNotificationStats
} from "@/services/notification.service.js";
import AppError from "@/utils/AppError.js";


/**
 * Get user's notifications
 */
const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const { page, limit, unreadOnly } = req.query;

    const result = await getUserNotifications(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const notification = await markAsRead(id as string, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const count = await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notifications marked as read`,
      data: { count }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
const removeNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    await deleteNotification(id as string, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 */
const clearRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const count = await deleteAllRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notifications deleted`,
      data: { count }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get notification preferences
 */
const getUserPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const preferences = await getPreferences(userId);

    res.status(200).json({
      success: true,
      data: { preferences }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 */
const updateUserPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const preferences = await updatePreferences(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Preferences updated',
      data: { preferences }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get notification statistics
 */
const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const stats = await getNotificationStats(userId);

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Test notification (development only)
 */
const sendTestNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const notification = await createNotification({
      recipientId: userId,
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working!',
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Test notification sent',
      data: { notification }
    });

    } catch (error) {
    next(error);
  }
};

export {
  getNotifications,
  markNotificationRead,
  markAllRead,
  removeNotification,
  clearRead,
  getUserPreferences,
  updateUserPreferences,
  getStats,
  sendTestNotification
};