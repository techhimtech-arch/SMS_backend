const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
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

// Compound index to ensure unique subject name per class per school
subjectSchema.index({ name: 1, classId: 1, schoolId: 1 }, { unique: true });

// Additional indexes for performance
subjectSchema.index({ schoolId: 1, isActive: 1 });
subjectSchema.index({ schoolId: 1, isDeleted: 1 });
subjectSchema.index({ classId: 1, isActive: 1 });
subjectSchema.index({ createdBy: 1 });

// Apply soft delete filter
addSoftDeleteFilter(subjectSchema);

module.exports = mongoose.model('Subject', subjectSchema);