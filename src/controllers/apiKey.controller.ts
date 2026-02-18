import { Request, Response, NextFunction } from "express";
import {
    createApiKey,
    getUserApiKeys,
    revokeApiKey,
    deleteApiKey,
    updateApiKey,
    getApiKeyStats
} from "@/services/apiKey.service.js";
import AppError from "@/utils/AppError.js";


/**
 * Create new API key
 */
const create = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        const {
            name,
            description,
            permissions,
            rateLimit,
            expiresInDays,
            allowedIps,
            allowedDomains
        } = req.body;

        const result = await createApiKey({
            name,
            userId,
            description,
            permissions,
            rateLimit,
            expiresInDays,
            allowedIps,
            allowedDomains
        });

        res.status(201).json({
            success: true,
            message: 'API key created successfully. Store it safely - you won\'t see it again',
            data: {
                apiKey: result.plainKey, // Only time user sees this!
                id: result.apiKey._id,
                name: result.apiKey.name,
                permissions: result.apiKey.permissions,
                expiresAt: result.apiKey.expiresAt
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get all user's API keys
 */
const getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        const apiKey = await getUserApiKeys(userId);

        res.status(200).json({
            success: true,
            data: { apiKey }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Revoke API key (disable but keep record)
 */
const revoke = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            throw new AppError('Not authenticated',  401);
        }

        const apiKey = await revokeApiKey(id as string, userId);

        res.status(200).json({
            success: true,
            message: 'API key revoked successfully',
            data: { apiKey }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete API key permanently
 */
const remove = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        
        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }
        
        await deleteApiKey(id as string, userId);
        
        res.status(200).json({
            success: true,
            message: 'API key deleted sucessfully'
        });
    } catch (error) {
      next(error);  
    }
};

/**
 * Update API key settings
 */
const update = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        const apiKey = await updateApiKey(id as string, userId, req.body);

        res.status(200).json({
            success: true,
            message: 'API key updated successfully',
            data: { apiKey }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get API key usage statistics
 */
const getStats = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        const stats = await getApiKeyStats(userId);

        res.status(200).json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        next(error);     
    }
};

export { create, getAll, revoke, remove, update, getStats}