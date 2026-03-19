const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  submissionText: {
    type: String,
    trim: true,
    maxlength: [10000, 'Submission text cannot exceed 10000 characters']
  },
  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  marksObtained: {
    type: Number,
    min: 0,
    default: null
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'LATE', 'GRADED'],
    default: 'SUBMITTED'
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateSubmissionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
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

// Compound index to prevent duplicate submissions per student
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
assignmentSubmissionSchema.index({ assignmentId: 1 });
assignmentSubmissionSchema.index({ studentId: 1 });
assignmentSubmissionSchema.index({ status: 1 });
assignmentSubmissionSchema.index({ isDeleted: 1 });
assignmentSubmissionSchema.index({ submittedAt: -1 });

// Apply soft delete filter
addSoftDeleteFilter(assignmentSubmissionSchema);

// Virtual to calculate percentage
assignmentSubmissionSchema.virtual('percentage').get(function() {
  if (this.marksObtained === null || !this.assignmentId?.maxMarks) {
    return null;
  }
  return ((this.marksObtained / this.assignmentId.maxMarks) * 100).toFixed(2);
});

// Pre-save middleware to validate submission
assignmentSubmissionSchema.pre('save', async function(next) {
  // Validate marks <= maxMarks when grading
  if (this.isModified('marksObtained') && this.marksObtained !== null) {
    const Assignment = mongoose.model('Assignment');
    const assignment = await Assignment.findById(this.assignmentId);

    if (!assignment) {
      return next(new Error('Assignment not found'));
    }

    if (this.marksObtained > assignment.maxMarks) {
      return next(new Error(`Marks obtained cannot exceed maximum marks (${assignment.maxMarks})`));
    }
  }

  // Check if submission is late
  if (this.isNew) {
    const Assignment = mongoose.model('Assignment');
    const assignment = await Assignment.findById(this.assignmentId);

    if (!assignment) {
      return next(new Error('Assignment not found'));
    }

    const now = new Date();
    if (now > assignment.dueDate) {
      this.isLate = true;
      this.status = 'LATE';
    }
  }

  next();
});

// Static method to find submissions by assignment
assignmentSubmissionSchema.statics.findByAssignment = function(assignmentId, filters = {}) {
  return this.find({
    assignmentId,
    isDeleted: { $ne: true },
    ...filters
  }).populate('studentId', 'name email rollNumber').sort({ submittedAt: -1 });
};

// Static method to find submissions by student
assignmentSubmissionSchema.statics.findByStudent = function(studentId, filters = {}) {
  return this.find({
    studentId,
    isDeleted: { $ne: true },
    ...filters
  }).populate('assignmentId', 'title subjectId dueDate maxMarks').sort({ submittedAt: -1 });
};

// Static method to check if student has submitted
assignmentSubmissionSchema.statics.hasSubmitted = async function(assignmentId, studentId) {
  const count = await this.countDocuments({
    assignmentId,
    studentId,
    isDeleted: { $ne: true }
  });
  return count > 0;
};

// Instance method to grade submission
assignmentSubmissionSchema.methods.grade = async function(marksObtained, remarks, gradedBy) {
  this.marksObtained = marksObtained;
  this.remarks = remarks;
  this.gradedBy = gradedBy;
  this.gradedAt = new Date();
  this.status = 'GRADED';
  return this.save();
};

// Instance method to soft delete
assignmentSubmissionSchema.methods.softDelete = async function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Instance method to restore
assignmentSubmissionSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
