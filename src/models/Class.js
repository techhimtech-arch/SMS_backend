const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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

// Indexes for performance
classSchema.index({ schoolId: 1, name: 1 }, { unique: true });
classSchema.index({ schoolId: 1, isActive: 1 });
classSchema.index({ schoolId: 1, isDeleted: 1 });
classSchema.index({ createdBy: 1 });

// Apply soft delete filter
addSoftDeleteFilter(classSchema);

module.exports = mongoose.model('Class', classSchema);