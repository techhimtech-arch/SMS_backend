const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Notification Service
 * Handles auto-creation of notifications for various events
 */

/**
 * Create notifications when an announcement is published
 * @param {Object} announcement - The published announcement
 */
const createAnnouncementNotifications = async (announcement) => {
  try {
    let recipients = [];

    switch (announcement.targetType) {
      case 'ALL':
        recipients = await User.find({
          isActive: true,
          isDeleted: { $ne: true }
        }).select('_id');
        break;

      case 'CLASS':
        recipients = await User.find({
          classId: { $in: announcement.targetIds },
          isActive: true,
          isDeleted: { $ne: true }
        }).select('_id');
        break;

      case 'SECTION':
        recipients = await User.find({
          sectionId: { $in: announcement.targetIds },
          isActive: true,
          isDeleted: { $ne: true }
        }).select('_id');
        break;

      case 'TEACHER':
      case 'STUDENT':
      case 'PARENT':
        recipients = await User.find({
          _id: { $in: announcement.targetIds },
          isActive: true,
          isDeleted: { $ne: true }
        }).select('_id');
        break;

      default:
        if (announcement.applicableRoles && announcement.applicableRoles.length > 0) {
          recipients = await User.find({
            role: { $in: announcement.applicableRoles },
            isActive: true,
            isDeleted: { $ne: true }
          }).select('_id');
        }
    }

    if (recipients.length === 0) {
      logger.info('No recipients found for announcement notification', {
        announcementId: announcement._id
      });
      return;
    }

    const notifications = recipients.map(recipient => ({
      recipientId: recipient._id,
      title: `New Announcement: ${announcement.title}`,
      message: announcement.message.substring(0, 200) + (announcement.message.length > 200 ? '...' : ''),
      type: 'ANNOUNCEMENT',
      relatedEntityId: announcement._id,
      relatedEntityType: 'Announcement',
      priority: announcement.priority,
      actionUrl: `/announcements/${announcement._id}`,
      createdBy: announcement.createdBy
    }));

    await Notification.insertMany(notifications);

    logger.info('Announcement notifications created', {
      announcementId: announcement._id,
      recipientCount: recipients.length
    });
  } catch (error) {
    logger.error('Error creating announcement notifications', {
      error: error.message,
      announcementId: announcement._id
    });
  }
};

/**
 * Create notifications when an assignment is published
 * @param {Object} assignment - The published assignment
 */
const createAssignmentNotifications = async (assignment) => {
  try {
    // Find all students in the class/section
    const recipients = await User.find({
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      role: 'student',
      isActive: true,
      isDeleted: { $ne: true }
    }).select('_id');

    if (recipients.length === 0) {
      logger.info('No recipients found for assignment notification', {
        assignmentId: assignment._id
      });
      return;
    }

    const notifications = recipients.map(recipient => ({
      recipientId: recipient._id,
      title: `New Assignment: ${assignment.title}`,
      message: `A new assignment has been published. Due date: ${new Date(assignment.dueDate).toLocaleDateString()}`,
      type: 'ASSIGNMENT',
      relatedEntityId: assignment._id,
      relatedEntityType: 'Assignment',
      priority: 'MEDIUM',
      actionUrl: `/assignments/${assignment._id}`,
      createdBy: assignment.createdBy
    }));

    await Notification.insertMany(notifications);

    logger.info('Assignment notifications created', {
      assignmentId: assignment._id,
      recipientCount: recipients.length
    });
  } catch (error) {
    logger.error('Error creating assignment notifications', {
      error: error.message,
      assignmentId: assignment._id
    });
  }
};

/**
 * Create notification when an assignment is graded
 * @param {Object} submission - The graded submission
 * @param {Object} assignment - The assignment
 * @param {Object} student - The student who submitted
 */
const createGradingNotification = async (submission, assignment, student) => {
  try {
    const notification = await Notification.create({
      recipientId: student._id,
      title: `Assignment Graded: ${assignment.title}`,
      message: `Your submission has been graded. Marks obtained: ${submission.marksObtained}/${assignment.maxMarks}`,
      type: 'ASSIGNMENT',
      relatedEntityId: assignment._id,
      relatedEntityType: 'Assignment',
      priority: 'HIGH',
      actionUrl: `/assignments/${assignment._id}/submissions`,
      createdBy: submission.gradedBy
    });

    logger.info('Grading notification created', {
      assignmentId: assignment._id,
      studentId: student._id,
      notificationId: notification._id
    });
  } catch (error) {
    logger.error('Error creating grading notification', {
      error: error.message,
      assignmentId: assignment._id,
      studentId: student._id
    });
  }
};

/**
 * Create a custom notification
 * @param {Object} notificationData - The notification data
 */
const createCustomNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);

    logger.info('Custom notification created', {
      notificationId: notification._id,
      recipientId: notification.recipientId
    });

    return notification;
  } catch (error) {
    logger.error('Error creating custom notification', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Bulk create notifications for multiple recipients
 * @param {Array} recipients - Array of user IDs
 * @param {Object} notificationTemplate - Template for notifications
 */
const bulkCreateNotifications = async (recipients, notificationTemplate) => {
  try {
    const notifications = recipients.map(recipientId => ({
      recipientId,
      ...notificationTemplate
    }));

    const result = await Notification.insertMany(notifications);

    logger.info('Bulk notifications created', {
      count: result.length
    });

    return result;
  } catch (error) {
    logger.error('Error creating bulk notifications', {
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  createAnnouncementNotifications,
  createAssignmentNotifications,
  createGradingNotification,
  createCustomNotification,
  bulkCreateNotifications
};
