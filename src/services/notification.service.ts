import Notification from "@/models/notification.model.js";
import type {
    INotification,
    INotificationPreference,
    CreateNotificationData
} from "@/types/notification.js";
import NotificationPreference from "@/models/notificationPreference.model.js";
import { getIO, isUserOnline } from "@/config/socket.js";
import { sendEmailNotification } from "@/utils/email.js";
import AppError from "@/utils/AppError.js";
import mongoose from "mongoose";


/**
 * Create notification
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
        priority = 'medium',
        expiresInDays
    } = data;

    // Calculate expiry
    let expiresAt: Date | undefined;
    if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Create notification
    const notification = await Notification.create({
        recipient: new mongoose.Types.ObjectId(recipientId),
        sender: senderId ? new mongoose.Types.ObjectId(senderId) : undefined,
        type,
        title,
        message,
        data: notificationData,
        actionUrl,
        priority,
        expiresAt
    });

    // Populate the sender info
    await notification.populate('sender', 'name email');

    // Get user preferences
    const preferences = await NotificationPreference.findOne({
        user: recipientId
    });

    // Send real-time notification if user is online
    if (isUserOnline(recipientId)) {
        try {
            const io = getIO();
            io.to(`user:${recipientId}`).emit('new-notification', {
                notification: notification.toObject()
            });
            console.log(`Real-time notification sent to user ${recipientId}`);
        } catch (error) {
            console.error('Failed to send real-time notification', error);
        }
    }

    // Send email notification if enabled
    if (
        preferences?.email.enabled &&
        preferences.email.types.includes(type) &&
        preferences.email.frequency === 'instant'
    ) {
        await sendEmailNotification(notification)
    };

    // TODO: Send push notification if enabled
  // if (preferences?.push.enabled && preferences.push.types.includes(type)) {
  //   await sendPushNotification(notification);
  // }

  return notification;
};

/**
 * Get user notification
 */
const getUserNotifications = async (
  userId: string,
  options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}
) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false
  } = options;

  const filter: any = {
    recipient: new mongoose.Types.ObjectId(userId)
  };

  if (unreadOnly) {
    filter.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(userId),
      isRead: false
    })
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    unreadCount
  };
};

/**
 * Mark as read
 */
const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<INotification> => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid notification ID', 400);
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: new mongoose.Types.ObjectId(userId)
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // Emit update to user
    if (isUserOnline(userId)) {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification-read', {
        notificationId: notification._id
      });
    }
  }

  return notification;
};

/**
 * Mark all as read
 */
const markAllAsRead = async (userId: string): Promise<number> => {
  const result = await Notification.updateMany(
    {
      recipient: new mongoose.Types.ObjectId(userId),
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  // Emit update to user
  if (isUserOnline(userId)) {
    const io = getIO();
    io.to(`user:${userId}`).emit('all-notifications-read');
  }

  return result.modifiedCount;
};

/**
 * Delete notification
 */
const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid notification ID', 400);
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: new mongoose.Types.ObjectId(userId)
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  await Notification.findByIdAndDelete(notificationId);
};

/**
 * Delete all read notifications
 */
const deleteAllRead = async (userId: string): Promise<number> => {
  const result = await Notification.deleteMany({
    recipient: new mongoose.Types.ObjectId(userId),
    isRead: true
  });

  return result.deletedCount;
};

/**
 * Get notification preferences
 * @param userId - User ID
 * @returns void
 */
const getPreferences = async (userId: string) => {
  let preferences = await NotificationPreference.findOne({
    user: new mongoose.Types.ObjectId(userId)
  });

  // Create default preferences if none exist
  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: new mongoose.Types.ObjectId(userId)
    });
  }

  return preferences;
};

/**
 * Update notification preferences
 */
const updatePreferences = async (
  userId: string,
  updates: Partial<INotificationPreference>
) => {
  let preferences = await NotificationPreference.findOne({
    user: new mongoose.Types.ObjectId(userId)
  });

  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: new mongoose.Types.ObjectId(userId),
      ...updates
    });
  } else {
    Object.assign(preferences, updates);
    await preferences.save();
  }

  return preferences;
};

/**
 * Notification statistics
 */
const getNotificationStats = async (userId: string) => {
  const [total, unread, byType] = await Promise.all([
    Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(userId)
    }),
    Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(userId),
      isRead: false
    }),
    Notification.aggregate([
      {
        $match: {
          recipient: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  return {
    total,
    unread,
    byType: byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>)
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
  getNotificationStats
};