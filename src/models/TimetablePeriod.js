const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const timetablePeriodSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
      min: [1, 'Period number must be at least 1'],
    },
    label: {
      type: String,
      required: true, // e.g., "Period 1", "Morning Break", "Lunch"
      trim: true
    },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(v);
        },
        message: 'Start time must be in HH:MM format (24-hour)'
      }
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(v);
        },
        message: 'End time must be in HH:MM format (24-hour)'
      }
    },
    isBreak: {
      type: Boolean,
      default: false
    },
    // Optional: Type of period (e.g., THEORY, PRACTICAL, BREAK)
    type: {
      type: String,
      enum: ['LECTURE', 'PRACTICAL', 'BREAK', 'ASSEMBLY', 'OTHER'],
      default: 'LECTURE'
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

// Unique index per school and academic year to avoid overlapping period numbers
timetablePeriodSchema.index({ 
  schoolId: 1, 
  academicYearId: 1, 
  periodNumber: 1,
  isDeleted: 1 
}, { unique: true });

// Performance indexes
timetablePeriodSchema.index({ schoolId: 1, isActive: 1 });
timetablePeriodSchema.index({ academicYearId: 1, schoolId: 1 });

// Apply soft delete filter
addSoftDeleteFilter(timetablePeriodSchema);

module.exports = mongoose.model('TimetablePeriod', timetablePeriodSchema);
