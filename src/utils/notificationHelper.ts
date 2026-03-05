import { createNotification } from "@/services/notification.service.js";


/**
 * Send welcome notification to new user
 */
export const sendWelcomeNotification = async (userId: string) => {
  return createNotification({
    recipientId: userId,
    type: 'success',
    title: 'Welcome to Master Backend system! 🎉',
    message: 'Thanks for joining us! Explore features and start building amazing things.',
    priority: 'medium',
    expiresInDays: 7
  });
};

/**
 * Notify user when their profile is updated
 */
export const sendProfileUpdatedNotification = async (userId: string) => {
  return createNotification({
    recipientId: userId,
    type: 'info',
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated.',
    priority: 'low'
  });
};

/**
 * Notify user when their account is banned
 */
export const sendAccountBannedNotification = async (
  userId: string,
  reason: string
) => {
  return createNotification({
    recipientId: userId,
    type: 'error',
    title: 'Account Suspended',
    message: `Your account has been suspended. Reason: ${reason}`,
    priority: 'urgent'
  });
};

/**
 * Notify user when file is uploaded
 */
export const sendFileUploadedNotification = async (
  userId: string,
  filename: string
) => {
  return createNotification({
    recipientId: userId,
    type: 'success',
    title: 'File Uploaded Successfully',
    message: `Your file "${filename}" has been uploaded.`,
    priority: 'low'
  });
};

/**
 * Notify user of security alert
 */
export const sendSecurityAlertNotification = async (
  userId: string,
  message: string
) => {
  return createNotification({
    recipientId: userId,
    type: 'warning',
    title: 'Security Alert',
    message,
    priority: 'high'
  });
};

/**
 * Send system maintenance notification
 */
export const sendMaintenanceNotification = async (
  userId: string,
  scheduledTime: Date
) => {
  return createNotification({
    recipientId: userId,
    type: 'system',
    title: 'Scheduled Maintenance',
    message: `System maintenance scheduled for ${scheduledTime.toLocaleString()}. Service may be temporarily unavailable.`,
    priority: 'medium'
  });
};