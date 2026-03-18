const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const sectionSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [50, 'Section name cannot exceed 50 characters']
    },
    classId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Class', 
      required: true 
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    schoolId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'School', 
      required: true 
    },
    capacity: { 
      type: Number, 
      default: 40,
      min: [1, 'Capacity must be at least 1'],
      max: [200, 'Capacity cannot exceed 200']
    },
    roomNumber: { 
      type: String,
      trim: true,
      maxlength: [20, 'Room number cannot exceed 20 characters']
    },
    floor: { 
      type: String,
      trim: true,
      maxlength: [30, 'Floor cannot exceed 30 characters']
    },
    building: { 
      type: String,
      trim: true,
      maxlength: [50, 'Building cannot exceed 50 characters']
    },
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: { 
      type: Boolean, 
      default: true 
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
    timestamps: true 
  }
);

// Indexes for performance and uniqueness
sectionSchema.index({ 
  name: 1, 
  classId: 1, 
  academicSessionId: 1, 
  schoolId: 1 
}, { unique: true });

// Performance indexes
sectionSchema.index({ schoolId: 1, isActive: 1 });
sectionSchema.index({ schoolId: 1, isDeleted: 1 });
sectionSchema.index({ classId: 1, academicSessionId: 1, isActive: 1 });
sectionSchema.index({ classTeacherId: 1, academicSessionId: 1, isActive: 1 });
sectionSchema.index({ createdBy: 1 });

// Apply soft delete filter
addSoftDeleteFilter(sectionSchema);

// Static methods for common queries
sectionSchema.statics.findByClass = function(classId, academicSessionId, schoolId) {
  return this.find({
    classId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).populate('classTeacherId', 'name email');
};

sectionSchema.statics.findByTeacher = function(teacherId, academicSessionId, schoolId) {
  return this.find({
    classTeacherId: teacherId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).populate('classId', 'name');
};

sectionSchema.statics.getClassSections = function(classId, academicSessionId, schoolId) {
  return this.find({
    classId,
    academicSessionId,
    schoolId,
    isActive: true,
    isDeleted: { $ne: true }
  }).sort({ name: 1 });
};

module.exports = mongoose.model('Section', sectionSchema);