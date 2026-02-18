import crypto from "crypto";
import mongoose from "mongoose";
import ApiKey from "@/models/apiKey.model.js";
import AppError from "@/utils/AppError.js";
import {
    CreateApiKeyData,
    ApiKeyValidationResult,
    UpdateApiKeyData
} from "@/types/apiKey.js";


/**
 * Generate a secure API key
 * Format: bmc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * @returns generated API key
 */
const generateApiKey = () => {
    const prefix = process.env.NODE_ENV === 'production' ? 'bmc_live' : 'bmc_test';
    const randomPart = crypto.randomBytes(24).toString('hex');
    
    return `${prefix}_${randomPart}`;
};

/**
 * Hash API key for storage
 * @param key - Api key to be 
 * @returns Hashed API Key
 */
const hashApiKey = (key: string): string => {
    return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * Create API key
 * @param data - apikey data
 * @returns created api key
 */
const createApiKey = async (data: CreateApiKeyData) => {
    const {
        name,
        userId,
        description,
        permissions,
        rateLimit,
        expiresInDays,
        allowedIps,
        allowedDomains
    } = data;

    // Generate plain API key (only time user sees this)
    const plainKey = generateApiKey();

    // Hash for storage
    const hashedKey = hashApiKey(plainKey);

    // Calculate expiry
    let expiresAt: Date | undefined;
    if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Create API Key
    const apiKey = await ApiKey.create({
        name,
        key: hashedKey,
        user: new mongoose.Types.ObjectId(userId),
        description,
        permissions,
        rateLimit: {
            requestsPerMinute: rateLimit?.requestsPerMinute || 60,
            requestsPerHour: rateLimit?.requestsPerHour || 1000,
            requestsPerDay: rateLimit?.requestsPerDay || 10000
        },
        expiresAt,
        allowedIps,
        allowedDomains
    });

    // Return the plan key (only time!)
    return {
        apiKey,
        plainKey // IMPORTANT: Store this safely, we can't retrieve it later!
    }
};

/**
 * Validate API key
 * @returns validate API key
 */
const validateApiKey = async (
    plainKey: string,
    requiredPermission?: string,
    clientIp?: string,
    clientDomain?: string
): Promise<ApiKeyValidationResult> => {
    // Hash the provided key
    const hashedKey = hashApiKey(plainKey);

    // find API key
    const apiKey = await ApiKey.findOne({
        key: hashedKey,
        isActive: true
    }).populate('user', 'name email isActive isBanned');

    if (!apiKey) {
        return {
            isValid: false,
            error: 'Invalid API key'
        };
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return {
            isValid: false,
            error: 'API key has expired'
        };
    }

    // Check user status
    const user = apiKey.user as any;
    if (!user.isActive || user.isBanned) {
        return {
            isValid: false,
            error: 'Account associated with this API key is inactive'
        };
    }

    // Check permissions
    if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
        return {
            isValid: false,
            error: `API key does not have '${requiredPermission}' permission`
        };
    }

    // Check IP restrictions
    if (apiKey.allowedIps && apiKey.allowedIps.length > 0) {
        if(!clientIp || !apiKey.allowedIps.includes(clientIp)) {
            return {
                isValid: false,
                error: 'IP address not allowed'
            };
        }
    }

    // Check domain restrictions
    if (apiKey.allowedDomains && apiKey.allowedDomains.length > 0) {
        if (!clientDomain || !apiKey.allowedDomains.some(d => clientDomain.endsWith(d))) {
            return {
                isValid: false,
                error: 'Domain not allowed'
            };
        }
    }

    // Update usage
    await ApiKey.findByIdAndUpdate(apiKey._id, {
        $inc: { usageCount: 1 },
        lastUsedAt: new Date()
    });

    return {
        isValid: true,
        apiKey
    };
};

/**
 * Get user's API KEYS
 * @param userId - User ID
 * @returns User's Api Keys
 */
const getUserApiKeys = async (userId: string) => {
    const apikeys = await ApiKey.find({
        user: new mongoose.Types.ObjectId(userId)
    })
        .select('-key') // Never return the actual key hash
        .sort({ createdAt: -1 })
        .lean();
    
    return apikeys;
};

/**
 * Revoke API key
 * @param apiKeyId - API key ID
 * @param userId - User ID
 * @returns revoked API key
 */
const revokeApiKey = async (apiKeyId: string, userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(apiKeyId)) {
        throw new AppError('Invalid API key ID', 400);
    }

    const apiKey = await ApiKey.findOne({
        _id: apiKeyId,
        user: new mongoose.Types.ObjectId(userId)
    });

    if (!apiKey) {
        throw new AppError('API key not found', 404);
    }

    apiKey.isActive = false;
    await apiKey.save();

    return apiKey;
};

/**
 * Delete API key
 * @param apiKeyId - API Key ID
 * @param userId - User ID
 */
const deleteApiKey = async (apiKeyId: string, userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(apiKeyId)) {
        throw new AppError('Invalid API key ID', 400);
    }

    const apiKey = await ApiKey.findOne({
        _id: apiKeyId,
        user: new mongoose.Types.ObjectId(userId)
    });

    if (!apiKey) {
        throw new AppError('API key not found', 404);
    }

    await ApiKey.findByIdAndDelete(apiKeyId);

    return { message: 'API key is deleted successfully'}
};

/**
 * Update API key
 * @param apiKeyId - API key ID
 * @param userId - User ID
 * @updates - API data updates
 */
const updateApiKey = async (
    apiKeyId: string,
    userId: string,
    updates: UpdateApiKeyData,
) => {
    if (!mongoose.Types.ObjectId.isValid(apiKeyId)) {
        throw new AppError('Invalid API ID', 400);
    }

    const apiKey = await ApiKey.findOne({
        _id: apiKeyId,
        user: new mongoose.Types.ObjectId(userId)
    });

    if (!apiKey) {
        throw new AppError('API key not found', 404);
    }

    // Update fields
    if (updates.name) apiKey.name = updates.name;
    if (updates.description !== undefined) apiKey.description = updates.description;
    if (updates.permissions) apiKey.permissions = updates.permissions;
    if (updates.allowedIps) apiKey.allowedIps = updates.allowedIps;
    if (updates.allowedDomains) apiKey.allowedDomains = updates.allowedDomains;

    if (updates.rateLimit) {
        apiKey.rateLimit = {
            ...apiKey.rateLimit,
            ...updates.rateLimit
        };
    }

    await apiKey.save();

    return apiKey;
};

/**
 * getApiKeyStats
 * @param userId - User ID
 * @returns API key statistics
 */
const getApiKeyStats = async (userId: string) => {
    const stats = await ApiKey.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalKeys: { $sum: 1 },
                activeKeys: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                },
                totalUsage: { $sum: '$usageCount' }
            }
        }
    ]);

    return stats[0] || {
        totalKeys: 0,
        activeKeys: 0,
        totalUsage: 0
    }
};

export {
    createApiKey,
    validateApiKey,
    getUserApiKeys,
    revokeApiKey,
    deleteApiKey,
    updateApiKey,
    getApiKeyStats
};