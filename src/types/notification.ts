/**
 * @module types/notification
 * @description Shared TypeScript types and interfaces for the notification system.
 */
import mongoose, { Document } from "mongoose";


/** Union of all valid notification category types. */
export type NotificationType = "info" | "success" | "warning" | "error" | "mention" | "system";

/** Union of all valid notification priority levels. */
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

/** Union of all valid email digest frequencies. */
export type EmailFrequency = "instant" | "daily" | "weekly";


/**
 * Mongoose document interface for a Notification.
 */
export interface INotification extends Document {
    /** ObjectId of the user receiving the notification. */
    recipient: mongoose.Types.ObjectId;
    /** ObjectId of the user or system entity that triggered the notification. */
    sender?: mongoose.Types.ObjectId;
    /** Category that controls display style and routing. */
    type: NotificationType;
    /** Short heading shown in the notification list. Max 100 chars. */
    title: string;
    /** Full notification body text. Max 500 chars. */
    message: string;
    /** Arbitrary structured payload for the notification consumer. */
    data?: Record<string, unknown>;
    /** Optional deep-link URL the user can navigate to for more context. */
    actionUrl?: string;
    /** Whether the user has read this notification. */
    isRead: boolean;
    /** Timestamp at which the notification was marked read. */
    readAt?: Date;
    /** Delivery priority; affects ordering and push behaviour. */
    priority: NotificationPriority;
    /** When set, MongoDB will automatically delete the document after this date (TTL index). */
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}


/**
 * Mongoose document interface for a user's notification preferences.
 */
export interface INotificationPreference extends Document {
    /** The owning user's ObjectId. */
    user: mongoose.Types.ObjectId;
    /** Email delivery settings. */
    email: {
        enabled: boolean;
        frequency: EmailFrequency;
        /** Notification types that trigger an email. */
        types: string[];
    };
    /** Push (FCM / APNS) delivery settings. */
    push: {
        enabled: boolean;
        /** Notification types that trigger a push notification. */
        types: string[];
    };
    /** In-app (Socket.io) delivery settings. */
    inApp: {
        enabled: boolean;
        /** Notification types shown in-app. */
        types: string[];
    };
    /** Do-not-disturb window configuration. */
    doNotDisturb: {
        enabled: boolean;
        /** 24-hour start time, e.g. "22:00". */
        startTime?: string;
        /** 24-hour end time, e.g. "08:00". */
        endTime?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}


/**
 * Input shape for creating a new notification via {@link createNotification}.
 */
export interface CreateNotificationData {
    /** MongoDB ObjectId string of the recipient user. */
    recipientId: string;
    /** MongoDB ObjectId string of the sender (optional, omit for system notifications). */
    senderId?: string;
    /** Notification category. */
    type: NotificationType;
    /** Short heading. Max 100 chars. */
    title: string;
    /** Notification body text. Max 500 chars. */
    message: string;
    /** Arbitrary structured payload attached to the notification. */
    data?: Record<string, unknown>;
    /** Optional deep-link URL for a "View Details" CTA. */
    actionUrl?: string;
    /** Delivery priority. Defaults to `'medium'`. */
    priority?: NotificationPriority;
    /**
     * Number of days until the notification is automatically deleted.
     * Omit to keep the notification indefinitely.
     */
    expiresInDays?: number;
}