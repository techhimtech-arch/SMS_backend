const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient ID is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['ANNOUNCEMENT', 'ASSIGNMENT', 'EXAM', 'FEE', 'SYSTEM'],
    required: [true, 'Notification type is required']
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    description: 'ID of the related entity (e.g., announcement, assignment)'
  },
  relatedEntityType: {
    type: String,
    enum: ['Announcement', 'Assignment', 'Exam', 'Fee', 'System'],
    description: 'Type of the related entity'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  actionUrl: {
    type: String,
    trim: true,
    description: 'Optional URL to redirect when notification is clicked'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isDeleted: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ relatedEntityId: 1, relatedEntityType: 1 });
notificationSchema.index({ sentAt: -1 });

// Apply soft delete filter
addSoftDeleteFilter(notificationSchema);

// Static method to find unread notifications for a user
notificationSchema.statics.findUnreadForUser = function(recipientId, filters = {}) {
  return this.find({
    recipientId,
    isRead: false,
    isDeleted: { $ne: true },
    ...filters
  }).sort({ priority: -1, sentAt: -1 });
};

// Static method to find all notifications for a user
notificationSchema.statics.findForUser = function(recipientId, filters = {}, options = {}) {
  const { limit = 20, skip = 0 } = options;

  return this.find({
    recipientId,
    isDeleted: { $ne: true },
    ...filters
  })
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to count unread notifications
notificationSchema.statics.countUnread = function(recipientId) {
  return this.countDocuments({
    recipientId,
    isRead: false,
    isDeleted: { $ne: true }
  });
};

// Static method to create notification for announcement publish
notificationSchema.statics.createForAnnouncement = async function(announcement, recipients) {
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

  return this.insertMany(notifications);
};

// Static method to create notification for assignment publish
notificationSchema.statics.createForAssignment = async function(assignment, recipients) {
  const notifications = recipients.map(recipient => ({
    recipientId: recipient._id,
    title: `New Assignment: ${assignment.title}`,
    message: `A new assignment has been published. Due date: ${assignment.dueDate.toLocaleDateString()}`,
    type: 'ASSIGNMENT',
    relatedEntityId: assignment._id,
    relatedEntityType: 'Assignment',
    priority: 'MEDIUM',
    actionUrl: `/assignments/${assignment._id}`,
    createdBy: assignment.createdBy
  }));

  return this.insertMany(notifications);
};

// Static method to create notification for assignment graded
notificationSchema.statics.createForGradedAssignment = async function(submission, assignment, student) {
  return this.create({
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
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return this;
};

// Instance method to archive
notificationSchema.methods.archive = async function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Instance method to soft delete
notificationSchema.methods.softDelete = async function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Instance method to restore
notificationSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
