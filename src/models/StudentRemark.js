const mongoose = require('mongoose');

const studentRemarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student ID is required']
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required']
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
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic Year ID is required']
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required']
    },
    
    // Remark details
    category: {
      type: String,
      enum: ['ACADEMIC', 'BEHAVIOR', 'DISCIPLINE', 'ATTENDANCE', 'EXTRA_CURRICULAR', 'GENERAL'],
      required: [true, 'Remark category is required']
    },
    type: {
      type: String,
      enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
      required: [true, 'Remark type is required']
    },
    title: {
      type: String,
      required: [true, 'Remark title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Remark description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Severity and importance
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    
    // Action taken (for negative remarks)
    actionTaken: {
      type: String,
      trim: true,
      maxlength: [500, 'Action taken cannot exceed 500 characters']
    },
    
    // Follow up required
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date
    },
    followUpNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Follow up notes cannot exceed 500 characters']
    },
    
    // Parent notification
    parentNotified: {
      type: Boolean,
      default: false
    },
    parentNotificationDate: {
      type: Date
    },
    
    // Status
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'CLOSED'],
      default: 'ACTIVE'
    },
    
    // Soft delete
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
  },
  {
    timestamps: true
  }
);

// Indexes for performance
studentRemarkSchema.index({ studentId: 1, academicYearId: 1 });
studentRemarkSchema.index({ teacherId: 1, schoolId: 1 });
studentRemarkSchema.index({ classId: 1, sectionId: 1 });
studentRemarkSchema.index({ category: 1, type: 1 });
studentRemarkSchema.index({ createdAt: -1 });
studentRemarkSchema.index({ followUpDate: 1 });

// Virtual for formatted date
studentRemarkSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Static method to get active remarks for a student
studentRemarkSchema.statics.getActiveRemarks = function(studentId, schoolId, academicYearId) {
  return this.find({
    studentId,
    schoolId,
    academicYearId,
    isDeleted: { $ne: true },
    status: { $in: ['ACTIVE', 'RESOLVED'] }
  }).sort({ createdAt: -1 });
};

// Static method to get remarks requiring follow-up
studentRemarkSchema.statics.getFollowUpRemarks = function(teacherId, schoolId) {
  return this.find({
    teacherId,
    schoolId,
    followUpRequired: true,
    followUpDate: { $lte: new Date() },
    status: { $ne: 'CLOSED' },
    isDeleted: { $ne: true }
  }).sort({ followUpDate: 1 });
};

// Pre-save middleware to set parent notification date
studentRemarkSchema.pre('save', function(next) {
  if (this.isModified('parentNotified') && this.parentNotified && !this.parentNotificationDate) {
    this.parentNotificationDate = new Date();
  }
  next();
});

const StudentRemark = mongoose.model('StudentRemark', studentRemarkSchema);

module.exports = StudentRemark;
