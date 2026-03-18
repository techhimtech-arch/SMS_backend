const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Exam name cannot exceed 200 characters']
    },
    examType: {
      type: String,
      required: true,
      enum: ['UNIT_TEST', 'MID_TERM', 'FINAL_TERM', 'PRACTICAL', 'VIVA', 'QUIZ', 'ASSIGNMENT'],
      default: 'UNIT_TEST'
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED', 'CANCELLED'],
      default: 'DRAFT'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters']
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: [0, 'Total marks cannot be negative']
    },
    passingPercentage: {
      type: Number,
      default: 40,
      min: [0, 'Passing percentage cannot be negative'],
      max: [100, 'Passing percentage cannot exceed 100']
    },
    duration: {
      type: Number, // in minutes
      min: [1, 'Duration must be at least 1 minute']
    },
    venue: {
      type: String,
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters']
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and uniqueness
examSchema.index({ 
  schoolId: 1, 
  sessionId: 1, 
  classId: 1, 
  sectionId: 1, 
  name: 1 
}, { unique: true });

examSchema.index({ 
  schoolId: 1, 
  sessionId: 1, 
  status: 1 
});

examSchema.index({ 
  schoolId: 1, 
  isDeleted: 1 
});

examSchema.index({ 
  classId: 1, 
  sectionId: 1, 
  sessionId: 1, 
  status: 1 
});

examSchema.index({ 
  createdBy: 1 
});

examSchema.index({ 
  startDate: 1, 
  endDate: 1 
});

// Apply soft delete filter
addSoftDeleteFilter(examSchema);

// Static methods for common queries
examSchema.statics.findByClass = function(classId, sectionId, sessionId, schoolId) {
  return this.find({
    classId,
    sectionId,
    sessionId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'updatedBy', select: 'name email' }
  ])
  .sort({ startDate: -1 });
};

examSchema.statics.getActiveExams = function(sessionId, schoolId) {
  return this.find({
    sessionId,
    schoolId,
    status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'classId', select: 'name' },
    { path: 'sectionId', select: 'name' },
    { path: 'createdBy', select: 'name email' }
  ])
  .sort({ startDate: 1 });
};

examSchema.statics.getPublishedExams = function(sessionId, schoolId) {
  return this.find({
    sessionId,
    schoolId,
    status: 'PUBLISHED',
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'classId', select: 'name' },
    { path: 'sectionId', select: 'name' }
  ])
  .sort({ startDate: -1 });
};

// Virtual for checking if exam is active
examSchema.virtual('isActiveExam').get(function() {
  return ['SCHEDULED', 'IN_PROGRESS'].includes(this.status);
});

// Virtual for checking if exam is completed
examSchema.virtual('isCompleted').get(function() {
  return ['COMPLETED', 'PUBLISHED'].includes(this.status);
});

// Pre-save middleware for validation
examSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

module.exports = mongoose.model('Exam', examSchema);