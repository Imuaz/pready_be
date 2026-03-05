/**
 * @module controllers/notification
 * @description Express route handlers for the notification system.
 * All handlers delegate business logic to the notification service and
 * forward any errors to the global error handler via `next(error)`.
 */
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
  getNotificationStats,
} from "@/services/notification.service.js";
import AppError from "@/utils/AppError.js";


/**
 * @route  GET /api/notifications
 * @desc   Get the authenticated user's notifications (paginated).
 * @access Private
 */
const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const { page, limit, unreadOnly } = req.query;

    const parsedPage = page ? parseInt(page as string, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;

    if (parsedPage !== undefined && isNaN(parsedPage)) throw new AppError("Invalid page parameter", 400);
    if (parsedLimit !== undefined && isNaN(parsedLimit)) throw new AppError("Invalid limit parameter", 400);

    const result = await getUserNotifications(userId, {
      page: parsedPage,
      limit: parsedLimit,
      unreadOnly: unreadOnly === "true",
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  POST /api/notifications/:id/read
 * @desc   Mark a single notification as read.
 * @access Private
 */
const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const notification = await markAsRead(req.params.id as string, userId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  POST /api/notifications/read-all
 * @desc   Mark all of the authenticated user's notifications as read.
 * @access Private
 */
const markAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const count = await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notification${count !== 1 ? "s" : ""} marked as read`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  DELETE /api/notifications/:id
 * @desc   Delete a single notification belonging to the authenticated user.
 * @access Private
 */
const removeNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    await deleteNotification(req.params.id as string, userId);

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  DELETE /api/notifications/clear-read
 * @desc   Delete all read notifications for the authenticated user.
 * @access Private
 */
const clearRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const count = await deleteAllRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notification${count !== 1 ? "s" : ""} deleted`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  GET /api/notifications/preferences
 * @desc   Get the authenticated user's notification preferences.
 * @access Private
 */
const getUserPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const preferences = await getPreferences(userId);

    res.status(200).json({ success: true, data: { preferences } });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  PUT /api/notifications/preferences
 * @desc   Update the authenticated user's notification preferences.
 * @access Private
 */
const updateUserPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const preferences = await updatePreferences(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Preferences updated",
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  GET /api/notifications/stats
 * @desc   Get notification statistics for the authenticated user.
 * @access Private
 */
const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const stats = await getNotificationStats(userId);

    res.status(200).json({ success: true, data: { stats } });
  } catch (error) {
    next(error);
  }
};


/**
 * @route  POST /api/notifications/test
 * @desc   Send a test notification to the authenticated user.
 * @access Private
 * @note   This endpoint is intended for development/debugging only.
 *         Consider disabling or gating behind an env check in production.
 */
const sendTestNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Not authenticated", 401);

    const notification = await createNotification({
      recipientId: userId,
      type: "info",
      title: "Test Notification",
      message: "This is a test notification to verify the system is working!",
      priority: "medium",
    });

    res.status(201).json({
      success: true,
      message: "Test notification sent",
      data: { notification },
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
  sendTestNotification,
};