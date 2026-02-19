import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request } from "express";
import AppError from "@/utils/AppError.js";


/**
 * General rate limiter for all routes
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 request per 15 minutes
    message: 'Too many request from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, _next, options) => {
        throw new AppError(
            options.message as string,
            429
        );
    }
});

/**
 * Strict rate limiter for auth routes (login, register)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 request per 15 minutes
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true, // Don't count successfull requests
    handler: (_req, _res, _next, options) => {
        throw new AppError(
            options.message as string,
            429
        );
    }
});

/**
 * Rate lmiter for password reset
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: 'To many password reset attempts, please try again later',
    handler: (_req, _res, _next, options) => {
        throw new AppError(
            options.message as string,
            429
        );
    }
});

/**
 * Dynamic rate limiter based on API key
 */
const apiKeyRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: async (req: Request) => {
        // If API key exists, use its rate limit
        if (req.apiKey) {
            // This would need to be populated from the API key validation
            return 60;
        }
        return 60; // Default for non-API key requests
    },
    keyGenerator: (req: Request) => {
        // Use API key as identifier if available
        if(req.apiKey) {
            return req.apiKey.id;
        }
        // Otherwise use normalized IP (safe for IPv6)
        return ipKeyGenerator(req);
    },
    handler: (_req, _res, _next, _options) => {
        throw new AppError(
            'Rate limit exceeded for this API key',
            429
        );
    }
});

/**
 * Create custom rate limiter
 */
const createRateLimiter = (
    windowMs: number,
    max: number,
    message?: string
) => {
    return rateLimit({
        windowMs,
        max,
        message: message || 'Too many requests, please try again later',
        handler: (_req, _res, _next, options) => {
            throw new AppError(
                options.message as string,
                429
            );
        }
    });
};

export {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    apiKeyRateLimiter,
    createRateLimiter
};