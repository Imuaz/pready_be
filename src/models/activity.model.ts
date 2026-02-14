import mongoose, { Schema, Model } from "mongoose";
import type { IActivity } from "@/types/activity.js";


const ActivitySchema: Schema<IActivity> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        action: {
            type: String,
            required: true,
            enum: [
                'login',
                'logout',
                'register',
                'password_reset',
                'email_verified',
                'profile_updated',
                'user_banned',
                'user_unbanned',
                'role_changed',
            ]
        },
        targetUser: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        details: String,
        ipAddress: String,
        userAgent: String
    },
    {
        timestamps: true
    }
);

// Indexes for efficient querying
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ action: 1, createdAt: -1 });

const Activity: Model<IActivity> = mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;