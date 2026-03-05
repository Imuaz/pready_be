/**
 * @module notification.routes
 * @description Express router for notification endpoints.
 * All routes require authentication via the `protect` middleware.
 *
 * Route ordering is intentional: specific paths (e.g. /stats, /clear-read)
 * must be declared before parametric routes (e.g. /:id) to prevent Express
 * from swallowing them as ID values.
 */
import express from "express";
import { protect } from "@/middleware/auth.js";
import {
    clearRead,
    getUserPreferences,
    getStats,
    getNotifications,
    markNotificationRead,
    markAllRead,
    removeNotification,
    sendTestNotification,
    updateUserPreferences,
} from "@/controllers/notification.controller.js";


const router = express.Router();

// All routes require authentication
router.use(protect);

// @route  GET /api/notifications
// @desc   Get user's notifications (paginated)
// @access Private
router.get("/", getNotifications);

// @route  GET /api/notifications/stats
// @desc   Get notification statistics (total, unread, by type)
// @access Private
router.get("/stats", getStats);

// @route  GET /api/notifications/preferences
// @desc   Get user's notification preferences
// @access Private
router.get("/preferences", getUserPreferences);

// @route  PUT /api/notifications/preferences
// @desc   Update user's notification preferences
// @access Private
router.put("/preferences", updateUserPreferences);

// @route  POST /api/notifications/read-all
// @desc   Mark all notifications as read
// @access Private
router.post("/read-all", markAllRead);

// @route  DELETE /api/notifications/clear-read
// @desc   Delete all read notifications
// @access Private
router.delete("/clear-read", clearRead);

// @route  POST /api/notifications/test
// @desc   Send a test notification to the authenticated user (development only)
// @access Private
router.post("/test", sendTestNotification);

// --- Parametric routes (must come after specific paths) ---

// @route  POST /api/notifications/:id/read
// @desc   Mark a single notification as read
// @access Private
router.post("/:id/read", markNotificationRead);

// @route  DELETE /api/notifications/:id
// @desc   Delete a notification by ID
// @access Private
router.delete("/:id", removeNotification);

export default router;