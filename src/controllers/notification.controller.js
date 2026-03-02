const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get notifications for current user
 */
const getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, isRead } = req.query;
  const userId = req.user._id;

  // Validate pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query = { userId };

  // Optional filter by read status
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  // Fetch notifications
  const notifications = await Notification.find(query)
    .populate('relatedDevice', 'name deviceType serialNumber')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  // Get total count
  const total = await Notification.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: notifications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
});

/**
 * Mark a notification as read
 */
const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find notification
  const notification = await Notification.findById(id);

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Verify notification belongs to current user
  if (notification.userId.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to update this notification');
  }

  // Mark as read
  notification.isRead = true;
  await notification.save();

  const updatedNotification = await Notification.findById(id).populate(
    'relatedDevice',
    'name deviceType serialNumber'
  );

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: updatedNotification,
  });
});

/**
 * Mark all notifications as read for current user
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Update all unread notifications
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: {
      updatedCount: result.modifiedCount,
    },
  });
});

/**
 * Get unread notification count for current user
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Count unread notifications
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  res.json({
    success: true,
    message: 'Unread notification count retrieved',
    data: {
      unreadCount,
    },
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
