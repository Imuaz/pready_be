import mongoose,{ Schema, Model } from "mongoose";
import type { INotification } from "@/types/notification.js";

const NotificationSchema: Schema<INotification> = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User'  
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warnig', 'error', 'mention', 'system'],
            default: 'info'
        },
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']

        },
        message:{
            type: String,
            required: [true, 'Notification message is required'],
            trim: true,
            maxlength: [500, 'Message cannot exceed 500 characters']
        },
        data: {
            type: Schema.Types.Mixed
        },
        actionUrl: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        expiresAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, {
    expireAfterSeconds: 0 // Auto-delete when expiresAt is reached
});

const Notification: Model<INotification> = mongoose.model<INotification>(
    'Notification',
    NotificationSchema
);

export default Notification;