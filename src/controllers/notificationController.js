const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const auditLogger = require('../utils/auditLogger');

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    isRead,
    type,
    priority,
    includeArchived = 'false'
  } = req.query;

  const filters = {};

  if (isRead !== undefined) {
    filters.isRead = isRead === 'true';
  }

  if (type) {
    filters.type = type;
  }

  if (priority) {
    filters.priority = priority;
  }

  if (includeArchived !== 'true') {
    filters.isArchived = false;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.findForUser(req.user.id, filters, { limit: limitNum, skip }),
    Notification.countDocuments({
      recipientId: req.user.id,
      isDeleted: { $ne: true },
      ...filters
    }),
    Notification.countUnread(req.user.id)
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: notifications
  });
});

/**
 * @desc    Get notification count (unread)
 * @route   GET /api/v1/notifications/count
 * @access  Private
 */
const getNotificationCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countUnread(req.user.id);

  res.status(200).json({
    success: true,
    data: { unreadCount }
  });
});

/**
 * @desc    Mark notification as read
 * @route   POST /api/v1/notifications/:id/mark-read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipientId: req.user.id,
    isDeleted: { $ne: true }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.markAsRead();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/v1/notifications/mark-all-read
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      recipientId: req.user.id,
      isRead: false,
      isDeleted: { $ne: true }
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: { modifiedCount: result.modifiedCount }
  });
});

/**
 * @desc    Delete notification (soft delete)
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipientId: req.user.id,
    isDeleted: { $ne: true }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.softDelete(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

/**
 * @desc    Archive notification
 * @route   POST /api/v1/notifications/:id/archive
 * @access  Private
 */
const archiveNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipientId: req.user.id,
    isDeleted: { $ne: true }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.archive();

  res.status(200).json({
    success: true,
    message: 'Notification archived successfully'
  });
});

module.exports = {
  getNotifications,
  getNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  archiveNotification
};
