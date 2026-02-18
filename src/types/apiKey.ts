/**
 * Types for api key related file
 */
import mongoose, { Document } from "mongoose";


export interface IApiKey extends Document {
    name: string;
    key: string;
    user: mongoose.Types.ObjectId;
    description?: string;
    permissions: string[];
    usageCount: number;
    lastUsedAt?: Date;
    rateLimit: {
        requestsPerMinute: number;
        requestsPerHour: number;
        requestsPerDay: number;
    };
    isActive: boolean;
    expiresAt?: Date;
    allowedIps?: string[];
    allowedDomains: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateApiKeyData {
  name: string;
  userId: string;
  description?: string;
  permissions?: string[];
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  expiresInDays?: number;
  allowedIps?: string[];
  allowedDomains?: string[];
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: IApiKey;
  error?: string;
}

export interface UpdateApiKeyData {
  name?: string;
  description?: string;
  permissions?: string[];
  rateLimit?: Partial<IApiKey['rateLimit']>;
  allowedIps?: string[];
  allowedDomains?: string[];
}