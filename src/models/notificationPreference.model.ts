import mongoose, { Schema, Model } from "mongoose";
import type { INotificationPreference } from "@/types/notification.js";


const NotificationPreferenceSchema: Schema<INotificationPreference> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true
        },
        email: {
            enabled: {
                type: Boolean,
                default: true
            },
            frequency: {
                type: String,
                enum: ['instant', 'daily', 'weekly'],
                default: 'instant'
            },
            types: {
                type: [String],
                default: ['mention', 'system', 'warning', 'error']
            }
        },
        push: {
            enabled: {
                type: Boolean,
                default: true
            },
            types: {
                type: [String],
                default: ['mention', 'urgent', 'system']
            }
        },
        inApp: {
            enabled: {
                type: Boolean,
                default: true
            },
            types: {
                type: [String],
                default: ['info', 'success', 'warning', 'error', 'mention', 'system']
            }
        },
        doNotDisturb: {
            enabled: {
                type: Boolean,
                default: false
            },
            startTime: String, // e.g., "22:00"
            endTime: String // e.g, "08.00"
        }
    },
    {
        timestamps: true
    }
);

const NotificationPreference: Model<INotificationPreference> = mongoose.model<INotificationPreference>(
    'NotificationPreference',
    NotificationPreferenceSchema
);

export default NotificationPreference;