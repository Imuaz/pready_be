/**
 * @module services/notification
 * @description Service layer for creating, querying, and managing notifications.
 * Handles real-time delivery via Socket.io and email delivery via Nodemailer.
 */

import Notification from "@/models/notification.model.js";
import type {
  INotification,
  INotificationPreference,
  CreateNotificationData,
} from "@/types/notification.js";
import NotificationPreference from "@/models/notificationPreference.model.js";
import { getIO, isUserOnline } from "@/config/socket.js";
import { sendEmailNotification } from "@/utils/email.js";
import AppError from "@/utils/AppError.js";
import mongoose from "mongoose";


/**
 * Creates a new notification and immediately delivers it to the
 * recipient via Socket.io (if online) and email (if preferences allow).
 *
 * @param data - Notification creation payload.
 * @returns The persisted {@link INotification} document (with `sender` populated).
 */
const createNotification = async (
  data: CreateNotificationData
): Promise<INotification> => {
  const {
    recipientId,
    senderId,
    type,
    title,
    message,
    data: notificationData,
    actionUrl,
    priority = "medium",
    expiresInDays,
  } = data;

  // Calculate optional TTL expiry date
  let expiresAt: Date | undefined;
  if (expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Persist the notification
  const notification = await Notification.create({
    recipient: new mongoose.Types.ObjectId(recipientId),
    sender: senderId ? new mongoose.Types.ObjectId(senderId) : undefined,
    type,
    title,
    message,
    data: notificationData,
    actionUrl,
    priority,
    expiresAt,
  });

  // Populate sender and recipient so downstream consumers can access their fields
  await notification.populate([
    { path: "sender", select: "name email" },
    { path: "recipient", select: "email name" },
  ]);

  // Fetch user preferences (may be null if never explicitly set)
  const preferences = await NotificationPreference.findOne({ user: recipientId });

  // ── Real-time delivery ────────────────────────────────────────────────────
  if (isUserOnline(recipientId)) {
    try {
      const io = getIO();
      io.to(`user:${recipientId}`).emit("new-notification", {
        notification: notification.toObject(),
      });
      console.log(`🔔 Real-time notification sent to user ${recipientId}`);
    } catch (error) {
      console.error("Failed to send real-time notification:", error);
    }
  }

  // ── Email delivery ────────────────────────────────────────────────────────
  const recipientDoc = notification.recipient as unknown as { email: string };
  if (
    preferences?.email.enabled &&
    preferences.email.types.includes(type) &&
    preferences.email.frequency === "instant" &&
    recipientDoc?.email
  ) {
    try {
      await sendEmailNotification(notification, recipientDoc.email);
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  }

  // TODO: Send push notification if enabled
  // if (preferences?.push.enabled && preferences.push.types.includes(type)) {
  //   await sendPushNotification(notification);
  // }

  return notification;
};


/**
 * Retrieves a paginated list of notifications for a user.
 *
 * @param userId     - The recipient's MongoDB ObjectId string.
 * @param options    - Pagination and filter options.
 * @param options.page       - Page number (1-indexed). Defaults to `1`.
 * @param options.limit      - Number of results per page. Defaults to `20`.
 * @param options.unreadOnly - When `true`, returns only unread notifications.
 * @returns An object containing `notifications`, `pagination`, and `unreadCount`.
 */
const getUserNotifications = async (
  userId: string,
  options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}
) => {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const filter: { recipient: mongoose.Types.ObjectId; isRead?: boolean } = {
    recipient: new mongoose.Types.ObjectId(userId),
  };

  if (unreadOnly) {
    filter.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate("sender", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(userId),
      isRead: false,
    }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    unreadCount,
  };
};


/**
 * Marks a single notification as read and emits a `notification-read` event
 * to the user's Socket.io room if they are online.
 *
 * @param notificationId - The notification's MongoDB ObjectId string.
 * @param userId         - The authenticated user's MongoDB ObjectId string.
 * @throws {AppError} 400 if `notificationId` is not a valid ObjectId.
 * @throws {AppError} 404 if the notification does not exist or does not belong to the user.
 * @returns The updated {@link INotification} document.
 */
const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<INotification> => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError("Invalid notification ID", 400);
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: new mongoose.Types.ObjectId(userId),
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    if (isUserOnline(userId)) {
      const io = getIO();
      io.to(`user:${userId}`).emit("notification-read", {
        notificationId: notification._id,
      });
    }
  }

  return notification;
};


/**
 * Marks all of a user's unread notifications as read and emits
 * `all-notifications-read` to their Socket.io room if online.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string.
 * @returns The number of documents updated.
 */
const markAllAsRead = async (userId: string): Promise<number> => {
  const result = await Notification.updateMany(
    {
      recipient: new mongoose.Types.ObjectId(userId),
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  if (isUserOnline(userId)) {
    const io = getIO();
    io.to(`user:${userId}`).emit("all-notifications-read");
  }

  return result.modifiedCount;
};


/**
 * Deletes a single notification owned by the specified user.
 *
 * @param notificationId - The notification's MongoDB ObjectId string.
 * @param userId         - The authenticated user's MongoDB ObjectId string.
 * @throws {AppError} 400 if `notificationId` is not a valid ObjectId.
 * @throws {AppError} 404 if the notification does not exist or does not belong to the user.
 */
const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError("Invalid notification ID", 400);
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: new mongoose.Types.ObjectId(userId),
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  await Notification.findByIdAndDelete(notificationId);
};


/**
 * Deletes all read notifications for a user.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string.
 * @returns The number of documents deleted.
 */
const deleteAllRead = async (userId: string): Promise<number> => {
  const result = await Notification.deleteMany({
    recipient: new mongoose.Types.ObjectId(userId),
    isRead: true,
  });

  return result.deletedCount;
};


/**
 * Returns the notification preferences for a user.
 * If no preferences document exists yet, one is created with defaults.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string.
 * @returns The user's {@link INotificationPreference} document.
 */
const getPreferences = async (userId: string) => {
  let preferences = await NotificationPreference.findOne({
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: new mongoose.Types.ObjectId(userId),
    });
  }

  return preferences;
};


/**
 * Updates a user's notification preferences using an upsert strategy.
 *
 * @param userId  - The authenticated user's MongoDB ObjectId string.
 * @param updates - Partial preference fields to apply.
 * @returns The updated (or newly created) {@link INotificationPreference} document.
 */
const updatePreferences = async (
  userId: string,
  updates: Partial<INotificationPreference>
) => {
  let preferences = await NotificationPreference.findOne({
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: new mongoose.Types.ObjectId(userId),
      ...updates,
    });
  } else {
    Object.assign(preferences, updates);
    await preferences.save();
  }

  return preferences;
};


/**
 * Returns aggregate statistics about a user's notifications.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string.
 * @returns An object with `total`, `unread`, and `byType` (a map of type → count).
 */
const getNotificationStats = async (userId: string) => {
  const [total, unread, byType] = await Promise.all([
    Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(userId),
    }),
    Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(userId),
      isRead: false,
    }),
    Notification.aggregate([
      {
        $match: { recipient: new mongoose.Types.ObjectId(userId) },
      },
      {
        $group: { _id: "$type", count: { $sum: 1 } },
      },
    ]),
  ]);

  return {
    total,
    unread,
    byType: byType.reduce(
      (acc, item) => {
        acc[item._id as string] = item.count as number;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
};


export {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getPreferences,
  updatePreferences,
  getNotificationStats,
};