import mongoose, { Document } from "mongoose";

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender?: mongoose.Types.ObjectId;
    type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'system';
    title: string;
    message: string;
    data?: {
        [key: string]: any;
    };
    actionUrl?: string;
    isRead: boolean;
    readAt?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}