const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Announcement message is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: ['GENERAL', 'ACADEMIC', 'EXAM', 'URGENT'],
    default: 'GENERAL'
  },
  targetType: {
    type: String,
    enum: ['ALL', 'CLASS', 'SECTION', 'TEACHER', 'STUDENT', 'PARENT'],
    required: [true, 'Target type is required'],
    default: 'ALL'
  },
  targetIds: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetRefPath'
  }],
  targetRefPath: {
    type: String,
    enum: ['Class', 'Section', 'User']
  },
  applicableRoles: [{
    type: String,
    enum: ['admin', 'teacher', 'student', 'parent']
  }],
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'EXPIRED'],
    default: 'DRAFT'
  },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
announcementSchema.index({ status: 1, priority: 1, publishDate: -1 });
announcementSchema.index({ targetType: 1, targetIds: 1 });
announcementSchema.index({ expiryDate: 1 });
announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ isDeleted: 1 });
announcementSchema.index({ applicableRoles: 1 });

// Apply soft delete filter
addSoftDeleteFilter(announcementSchema);

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.expiryDate && this.expiryDate < new Date();
});

// Virtual for checking if announcement is active
announcementSchema.virtual('isActive').get(function() {
  const now = new Date();
  const isExpired = this.expiryDate && this.expiryDate < now;
  return this.status === 'PUBLISHED' && !isExpired;
});

// Pre-save middleware to validate dates
announcementSchema.pre('save', function(next) {
  // Validate expiryDate > publishDate
  if (this.expiryDate && this.publishDate) {
    if (new Date(this.expiryDate) <= new Date(this.publishDate)) {
      return next(new Error('Expiry date must be after publish date'));
    }
  }

  // Validate targetIds when targetType != ALL
  if (this.targetType !== 'ALL' && (!this.targetIds || this.targetIds.length === 0)) {
    return next(new Error('Target IDs are required when target type is not ALL'));
  }

  // Auto expire announcements
  const now = new Date();
  if (this.expiryDate && this.expiryDate < now && this.status === 'PUBLISHED') {
    this.status = 'EXPIRED';
  }

  next();
});

// Static method to find active announcements
announcementSchema.statics.findActive = function(filter = {}) {
  const now = new Date();
  return this.find({
    ...filter,
    status: 'PUBLISHED',
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: now } }
    ]
  }).sort({ priority: -1, publishDate: -1 });
};

// Static method to find announcements visible to user
announcementSchema.statics.findVisibleToUser = function(userId, userRole, classId = null, sectionId = null) {
  const now = new Date();
  const query = {
    status: 'PUBLISHED',
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: now } }
    ],
    $and: [
      {
        $or: [
          { targetType: 'ALL' },
          { applicableRoles: { $in: [userRole] } }
        ]
      }
    ]
  };

  // Add target-specific filters
  if (classId) {
    query.$and[0].$or.push({
      targetType: 'CLASS',
      targetIds: classId
    });
  }

  if (sectionId) {
    query.$and[0].$or.push({
      targetType: 'SECTION',
      targetIds: sectionId
    });
  }

  query.$and[0].$or.push({
    targetType: { $in: ['TEACHER', 'STUDENT', 'PARENT'] },
    targetIds: userId
  });

  return this.find(query).sort({ priority: -1, publishDate: -1 });
};

// Instance method to soft delete
announcementSchema.methods.softDelete = async function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Instance method to restore
announcementSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('Announcement', announcementSchema);
