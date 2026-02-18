import express from "express";
import { protect } from "@/middleware/auth.js";
import validate from "@/middleware/validate.js";
import {
    create,
    getAll,
    revoke,
    remove,
    update,
    getStats
} from "@/controllers/apiKey.controller.js";
import {
    createApiKeyValidator,
    updateApiKeyValidator,
    apiKeyIdValidator
} from "@/validators/apiKey.validators.js";


const router = express.Router();

// All routes require authentication
router.use(protect);

// @route POST /api/api-keys
// @desc Create new API key
// @access Private
router.post('/', validate(createApiKeyValidator), create);

// @route GET /api/api-keys
// @desc Get all user's API keys
router.get('/', getAll);

// @route GET /api/api-keys/stats
// @desc Get APIkey usage statistics
// @access Private
router.get('/stats', getStats);

// @route   PATCH /api/api-keys/:id
// @desc    Update API key settings
// @access  Private
router.patch('/:id', validate(updateApiKeyValidator), update);

// @route   POST /api/api-keys/:id/revoke
// @desc    Revoke API key (disable)
// @access  Private
router.post('/:id/revoke', validate(apiKeyIdValidator), revoke);

// @route   DELETE /api/api-keys/:id
// @desc    Delete API key permanently
// @access  Private
router.delete('/:id', validate(apiKeyIdValidator), remove);

export default router;