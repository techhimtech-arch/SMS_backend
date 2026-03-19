const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: [0, 'Maximum marks cannot be negative']
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
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'CLOSED'],
    default: 'DRAFT'
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    description: 'Percentage penalty for late submission (0-100)'
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
assignmentSchema.index({ classId: 1, sectionId: 1, dueDate: 1 });
assignmentSchema.index({ subjectId: 1 });
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ isDeleted: 1 });
assignmentSchema.index({ dueDate: 1 });

// Apply soft delete filter
addSoftDeleteFilter(assignmentSchema);

// Virtual to check if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Virtual to get submission count
assignmentSchema.virtual('submissionCount', {
  ref: 'AssignmentSubmission',
  localField: '_id',
  foreignField: 'assignmentId',
  count: true,
  match: { isDeleted: { $ne: true } }
});

// Pre-save middleware to validate due date
assignmentSchema.pre('save', function(next) {
  // Validate dueDate is in the future for new assignments
  if (this.isNew && this.dueDate) {
    const now = new Date();
    if (new Date(this.dueDate) <= now) {
      return next(new Error('Due date must be in the future'));
    }
  }
  next();
});

// Static method to find active assignments for a class/section
assignmentSchema.statics.findActiveForClass = function(classId, sectionId) {
  const now = new Date();
  return this.find({
    classId,
    sectionId,
    status: 'PUBLISHED',
    dueDate: { $gt: now },
    isDeleted: { $ne: true }
  }).sort({ dueDate: 1 });
};

// Static method to find assignments for a student
assignmentSchema.statics.findForStudent = function(studentClassId, studentSectionId, filters = {}) {
  const query = {
    classId: studentClassId,
    sectionId: studentSectionId,
    status: 'PUBLISHED',
    isDeleted: { $ne: true },
    ...filters
  };

  return this.find(query).sort({ dueDate: 1 });
};

// Static method to find assignments by teacher
assignmentSchema.statics.findByTeacher = function(teacherId, filters = {}) {
  return this.find({
    teacherId,
    isDeleted: { $ne: true },
    ...filters
  }).sort({ createdAt: -1 });
};

// Instance method to soft delete
assignmentSchema.methods.softDelete = async function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Instance method to restore
assignmentSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Instance method to publish assignment
assignmentSchema.methods.publish = async function() {
  this.status = 'PUBLISHED';
  return this.save();
};

// Instance method to close assignment
assignmentSchema.methods.close = async function() {
  this.status = 'CLOSED';
  return this.save();
};

module.exports = mongoose.model('Assignment', assignmentSchema);
