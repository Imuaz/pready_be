import mongoose, { Schema, Model } from "mongoose";
import { IApiKey } from "@/types/apiKey.js";


const ApiKeySchema: Schema<IApiKey> = new Schema({
    name: {
        type: String,
        required: [true, 'API key name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    description: {
        type: [String],
        default: ['read'],
        enum:['read', 'write', 'delete', 'admin']
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsedAt: Date,
    rateLimit: {
        requestsPerMinute: {
            type: Number,
            default: 60
        },
        requestsPerHour: {
            type: Number,
            default: 1000
        },
        requestsPerDay: {
            type: Number,
            default: 10000
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: Date,
    allowedIps: [String],
    allowedDomains: [String]
},
{
    timestamps: true
}
);

// Indexes for efficient queries
ApiKeySchema.index({ key: 1, isActive: 1 });
ApiKeySchema.index({ user: 1, isActive: 1 });
ApiKeySchema.index({ expiresAt: 1 });

const ApiKey: Model<IApiKey> = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);

export default ApiKey;