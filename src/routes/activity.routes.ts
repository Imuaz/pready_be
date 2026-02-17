import express from "express";
import { protect, authorize } from "@/middleware/auth.js";
import {
    getAllActivities,
    getMyActivities,
    getStats
} from "@/controllers/activity.controller.js";


const router = express.Router();

// @route GET /api/activities/me
// @decs Get current user's activity
// @access Private
router.get('/me', protect, getMyActivities);

// @route GET /api/activities/stats
// @decs Get activity statistice
// @access Private + Admin
router.get(
    '/stats',
    protect,
    authorize('admin'),
    getStats
);

// @route GET /api/activities
// @decs Get all activities with filters
// @access Private + Admin
router.get(
    '/',
    protect,
    authorize('admin'),
    getAllActivities
);

export default router;