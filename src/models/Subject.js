const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Subject code cannot exceed 20 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    department: {
      type: String,
      enum: ['SCIENCE', 'COMMERCE', 'ARTS', 'LANGUAGE', 'MATHEMATICS', 'PHYSICAL_EDUCATION', 'COMPUTER_SCIENCE', 'OTHER'],
      default: 'OTHER'
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    teacherIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isOptional: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    credits: {
      type: Number,
      min: [0, 'Credits cannot be negative'],
      max: [10, 'Credits cannot exceed 10'],
      default: 1
    },
    weeklyHours: {
      type: Number,
      min: [0, 'Weekly hours cannot be negative'],
      max: [40, 'Weekly hours cannot exceed 40'],
      default: 1
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }],
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

// Indexes for performance and validation
// Subject code can be duplicate across different classes in same school, but unique within same class + session
subjectSchema.index({ code: 1, classId: 1, academicSessionId: 1, schoolId: 1 }, { unique: true });
subjectSchema.index({ name: 1, classId: 1, academicSessionId: 1, schoolId: 1 }, { unique: true });

// Performance indexes
subjectSchema.index({ schoolId: 1, isActive: 1 });
subjectSchema.index({ schoolId: 1, isDeleted: 1 });
subjectSchema.index({ classId: 1, academicSessionId: 1, isActive: 1 });
subjectSchema.index({ department: 1, schoolId: 1 });
subjectSchema.index({ academicSessionId: 1, schoolId: 1 });
subjectSchema.index({ teacherIds: 1 });
subjectSchema.index({ createdBy: 1 });

// Apply soft delete filter
addSoftDeleteFilter(subjectSchema);

// Static methods for common queries
subjectSchema.statics.findByClass = function(classId, academicSessionId, schoolId) {
  return this.find({
    classId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).populate('teacherIds', 'name email');
};

subjectSchema.statics.findByTeacher = function(teacherId, academicSessionId, schoolId) {
  return this.find({
    teacherIds: teacherId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).populate('classId', 'name');
};

subjectSchema.statics.findOptionalSubjects = function(classId, academicSessionId, schoolId) {
  return this.find({
    classId,
    academicSessionId,
    schoolId,
    isOptional: true,
    isActive: true,
    isDeleted: { $ne: true }
  });
};

module.exports = mongoose.model('Subject', subjectSchema);