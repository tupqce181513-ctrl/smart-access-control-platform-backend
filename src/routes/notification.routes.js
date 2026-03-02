const express = require('express');
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const validateQuery = require('../middlewares/validateQuery.middleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * GET /api/notifications
 * Get notifications for current user
 */
router.get(
  '/',
  validateQuery({
    page: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
    isRead: {
      type: 'string',
    },
  }),
  notificationController.getNotifications
);

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', notificationController.getUnreadCount);

module.exports = router;
