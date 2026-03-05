/**
 * @module utils/notificationHelper
 * @description Convenience wrappers around {@link createNotification} for common
 * application-level notification events (welcome, profile update, bans, etc.).
 *
 * Each helper encapsulates the notification payload so that call sites remain
 * concise and the notification copy lives in one place.
 */
import type { INotification } from "@/types/notification.js";
import { createNotification } from "@/services/notification.service.js";


/**
 * Sends a welcome notification to a newly registered user.
 *
 * @param userId - The new user's MongoDB ObjectId string.
 * @returns The created {@link INotification} document.
 */
export const sendWelcomeNotification = async (userId: string): Promise<INotification> => {
  return createNotification({
    recipientId: userId,
    type: "success",
    title: "Welcome to Master Backend system! 🎉",
    message: "Thanks for joining us! Explore the features and start building amazing things.",
    priority: "medium",
    expiresInDays: 7,
  });
};


/**
 * Notifies a user that their profile information has been updated.
 *
 * @param userId - The target user's MongoDB ObjectId string.
 * @returns The created {@link INotification} document.
 */
export const sendProfileUpdatedNotification = async (userId: string): Promise<INotification> => {
  return createNotification({
    recipientId: userId,
    type: "info",
    title: "Profile Updated",
    message: "Your profile has been successfully updated.",
    priority: "low",
  });
};


/**
 * Notifies a user that their account has been suspended.
 *
 * @param userId - The suspended user's MongoDB ObjectId string.
 * @param reason - The reason for the suspension (shown in the notification body).
 * @returns The created {@link INotification} document.
 */
export const sendAccountBannedNotification = async (
  userId: string,
  reason: string
): Promise<INotification> => {
  return createNotification({
    recipientId: userId,
    type: "error",
    title: "Account Suspended",
    message: `Your account has been suspended. Reason: ${reason}`,
    priority: "urgent",
  });
};


/**
 * Notifies a user that a file upload completed successfully.
 *
 * @param userId   - The uploader's MongoDB ObjectId string.
 * @param filename - The original filename that was uploaded.
 * @returns The created {@link INotification} document.
 */
export const sendFileUploadedNotification = async (
  userId: string,
  filename: string
): Promise<INotification> => {
  return createNotification({
    recipientId: userId,
    type: "success",
    title: "File Uploaded Successfully",
    message: `Your file "${filename}" has been uploaded.`,
    priority: "low",
  });
};


/**
 * Sends a security alert notification to a user (e.g. new device login, password change).
 *
 * @param userId  - The target user's MongoDB ObjectId string.
 * @param message - A human-readable description of the security event.
 * @returns The created {@link INotification} document.
 */
export const sendSecurityAlertNotification = async (
  userId: string,
  message: string
): Promise<INotification> => {
  return createNotification({
    recipientId: userId,
    type: "warning",
    title: "Security Alert",
    message,
    priority: "high",
  });
};


/**
 * Informs a user of upcoming scheduled maintenance.
 *
 * @param userId        - The target user's MongoDB ObjectId string.
 * @param scheduledTime - The date/time at which maintenance is scheduled to begin.
 * @returns The created {@link INotification} document.
 */
export const sendMaintenanceNotification = async (
  userId: string,
  scheduledTime: Date
): Promise<INotification> => {
  return createNotification({
    recipientId: userId,
    type: "system",
    title: "Scheduled Maintenance",
    message: `System maintenance is scheduled for ${scheduledTime.toLocaleString()}. Service may be temporarily unavailable.`,
    priority: "medium",
  });
};
