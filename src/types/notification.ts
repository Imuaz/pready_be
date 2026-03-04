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

export interface INotificationPreference extends Document {
    user: mongoose.Types.ObjectId;
    email: {
        enabled: boolean;
        frequency: 'instant' | 'daily' | 'weekly';
        types: string[];
    };
    push: {
        enabled: boolean;
        types: string[];
    };
    inApp: {
        enabled: boolean;
        types: string[];
    };
    doNotDisturb: {
        enabled: boolean;
        startTime?: string;
        endTime?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNotificationData {
    recipientId: string;
    senderId?: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'system';
    title: string;
    message: string;
    data?: any;
    actionUrl?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    expiresInDays?: number;
}