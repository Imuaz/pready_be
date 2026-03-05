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
    updateUserPreferences

} from "@/controllers/notification.controller.js";


const router = express.Router();

// All routes require authentication
router.use(protect);

// @route  GET /api/notifications
// @desc   Get user's notifications
// @access Private
router.get('/', getNotifications);

// @route  GET /api/notifications/stats
// @desc   Get notification statistics
// @access Private
router.get('/stats', getStats);

// @route  POST /api/notifications/:id/read
// @desc   Mark all notifications as read
// @access Private
router.post('/:id/read', markNotificationRead);

// @route  POST /api/notifications/read-all
// @desc   Mark all notifications as read
// @access Private
router.post('/read-all', markAllRead);

// @route  DELETE /api/notifications/:id
// @desc   Delete notification
// @access Private
router.delete('/:id', removeNotification);

// @route  DELETE /api/notifications/clear-read
// @desc   Delete all read notifications
// @access Private
router.delete('/clear-read', clearRead);

// @route  GET /api/notifications/preferences
// @desc   Get notification preferences
// @access Private
router.get('/preferences', getUserPreferences);

// @route  PUT /api/notifications/preferences
// @desc   Update notification preferences
// @access Private
router.put('/preferences', updateUserPreferences);

// @route  POST /api/notifications/test
// @desc   Send test notification
// @access Private
router.post('/test', sendTestNotification);

export default router;