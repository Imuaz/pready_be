import express, { Request, Response } from 'express';
import { authenticateApiKey, authenticateFlexible } from '../middleware/apiKeyAuth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ─────────────────────────────────────────
// PUBLIC DEMO ROUTES (with rate limiting)
// ─────────────────────────────────────────

// @route   GET /api/demo/public
// @desc    Public endpoint with general rate limit
// @access  Public
router.get(
  '/public',
  createRateLimiter(60000, 10), // 10 requests per minute
  (_req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'Public endpoint - rate limited to 10 req/min',
      data: {
        timestamp: new Date().toISOString(),
        endpoint: 'public'
      }
    });
  }
);

// ─────────────────────────────────────────
// API KEY PROTECTED ROUTES
// ─────────────────────────────────────────

// @route   GET /api/demo/api-key-only
// @desc    Requires valid API key
// @access  API Key
router.get(
  '/api-key-only',
  authenticateApiKey(),
  (req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'API key authenticated successfully',
      data: {
        user: req.user,
        apiKey: {
          name: req.apiKey?.name,
          permissions: req.apiKey?.permissions
        }
      }
    });
  }
);

// @route   GET /api/demo/read-only
// @desc    Requires API key with 'read' permission
// @access  API Key (read)
router.get(
  '/read-only',
  authenticateApiKey('read'),
  (_req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'Read permission verified',
      data: {
        sampleData: ['item1', 'item2', 'item3']
      }
    });
  }
);

// @route   POST /api/demo/write-required
// @desc    Requires API key with 'write' permission
// @access  API Key (write)
router.post(
  '/write-required',
  authenticateApiKey('write'),
  (req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'Write permission verified',
      data: {
        created: req.body,
        timestamp: new Date().toISOString()
      }
    });
  }
);

// ─────────────────────────────────────────
// FLEXIBLE AUTH ROUTES (JWT or API Key)
// ─────────────────────────────────────────

// @route   GET /api/demo/flexible
// @desc    Accepts either JWT Bearer token or API key
// @access  Private (JWT or API Key)
router.get(
  '/flexible',
  authenticateFlexible(),
  (req: Request, res: Response): void => {
    const authMethod = req.apiKey ? 'API Key' : 'JWT Token';

    res.json({
      success: true,
      message: `Authenticated via ${authMethod}`,
      data: {
        user: req.user,
        authMethod,
        ...(req.apiKey && { apiKeyName: req.apiKey.name })
      }
    });
  }
);

// @route   GET /api/demo/rate-limit-test
// @desc    Endpoint to test rate limiting
// @access  Public
router.get(
  '/rate-limit-test',
  createRateLimiter(10000, 3), // Only 3 requests per 10 seconds
  (_req: Request, res: Response): void => {
    res.json({
      success: true,
      message: 'Rate limit test - 3 requests per 10 seconds',
      data: {
        timestamp: new Date().toISOString()
      }
    });
  }
);

export default router;