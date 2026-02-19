import { Request, Response, NextFunction } from "express";
import { validateApiKey } from "@/services/apiKey.service.js";
import AppError from "@/utils/AppError.js";


/**
 * Authenticate using API
 * API key should be in header: X-API-Key: bmc_live_xxxx
 */
const authenticateApiKey = (requiredPermission?: string) => {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            // Extract API key from header
            const apiKey = req.headers['x-api-key'] as string;

            if (!apiKey) {
                throw new AppError(
                    'API key is required. Please provide X-API-Key header',
                    401
                );
            }

            // Get client info
            const clientIp = req.ip || req.socket.remoteAddress;
            const clientDomain = req.hostname;

            // Validate API key
            const result = await validateApiKey(
                apiKey,
                requiredPermission,
                clientIp,
                clientDomain
            );

            if (!result.isValid) {
                throw new AppError(result.error || 'Invalid API key', 401)
            }

            // Attach user and API key info to request
            const user = result.apiKey!.user as any;
            req.user = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            };

            req.apiKey = {
                id: result.apiKey!._id.toString(),
                name: result.apiKey!.name,
                permissions: result.apiKey!.permissions
            };

            // Proceed to the next middleware/handler
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Allow either JWT or API key authentication
 */
const authenticateFlexible = (requiredPermission?: string) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            // Try JWT first
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                // Use JWT auth middleware logic
                const { protect } = await import('./auth.js');
                return protect(req, res, next);
            }

            // Try API key
            const apiKey = req.headers['x-api-key'] as string;

            if (apiKey) {
                return authenticateApiKey(requiredPermission)(req, res, next);
            }

            // No auth provided
            throw new AppError(
                'Authentication required. Provide either Bearer token or X-API-Key header',
                401
            );
        } catch (error) {
            next(error);
        }
    }
};

export { authenticateApiKey, authenticateFlexible };