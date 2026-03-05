/**
 * @module models/notificationPreference
 * @description Mongoose model for storing per-user notification delivery preferences.
 * A document is created on first access (lazy upsert) via the notification service.
 */
import mongoose, { Schema, Model } from "mongoose";
import type { INotificationPreference } from "@/types/notification.js";


const NotificationPreferenceSchema: Schema<INotificationPreference> = new Schema(
    {
        /** Reference to the owning User document. One preference document per user. */
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        /** Email delivery configuration. */
        email: {
            enabled: {
                type: Boolean,
                default: true,
            },
            frequency: {
                type: String,
                enum: ["instant", "daily", "weekly"],
                default: "instant",
            },
            /** Notification types that will trigger an email. */
            types: {
                type: [String],
                default: ["mention", "system", "warning", "error"],
            },
        },
        /** Push notification (FCM / APNS) configuration. */
        push: {
            enabled: {
                type: Boolean,
                default: true,
            },
            /** Notification types that will trigger a push notification. */
            types: {
                type: [String],
                default: ["mention", "urgent", "system"],
            },
        },
        /** In-app (Socket.io) notification configuration. */
        inApp: {
            enabled: {
                type: Boolean,
                default: true,
            },
            /** Notification types delivered in-app. */
            types: {
                type: [String],
                default: ["info", "success", "warning", "error", "mention", "system"],
            },
        },
        /** Do-not-disturb window. All channels are suppressed during this period. */
        doNotDisturb: {
            enabled: {
                type: Boolean,
                default: false,
            },
            /** 24-hour time string, e.g. "22:00" */
            startTime: String,
            /** 24-hour time string, e.g. "08:00" */
            endTime: String,
        },
    },
    {
        timestamps: true,
    }
);


const NotificationPreference: Model<INotificationPreference> = mongoose.model<INotificationPreference>(
    "NotificationPreference",
    NotificationPreferenceSchema
);

export default NotificationPreference;