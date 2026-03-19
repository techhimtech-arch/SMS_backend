const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const feeHeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee head name is required'],
    trim: true,
    maxlength: [100, 'Fee head name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: [0, 'Fee amount cannot be negative']
  },
  frequency: {
    type: String,
    enum: ['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'],
    default: 'YEARLY',
    required: [true, 'Fee frequency is required']
  },
  mandatory: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, { _id: true });

const feeStructureSchema = new mongoose.Schema(
  {
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
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic session ID is required'],
      index: true
    },
    // Legacy field for backward compatibility
    academicYear: {
      type: String,
    },
    feeHeads: {
      type: [feeHeadSchema],
      default: []
    },
    // Legacy fields for backward compatibility
    tuitionFee: {
      type: Number,
      default: 0,
    },
    transportFee: {
      type: Number,
      default: 0,
    },
    examFee: {
      type: Number,
      default: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now
    },
    effectiveTill: {
      type: Date
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
feeStructureSchema.index({ classId: 1, academicSessionId: 1, schoolId: 1 }, { unique: true });
feeStructureSchema.index({ isActive: 1, effectiveFrom: -1 });
feeStructureSchema.index({ isDeleted: 1 });

// Apply soft delete filter
addSoftDeleteFilter(feeStructureSchema);

// Pre-save middleware to calculate total amount
feeStructureSchema.pre('save', function(next) {
  // Calculate from feeHeads if available (Phase 5)
  if (this.feeHeads && this.feeHeads.length > 0) {
    this.totalAmount = this.feeHeads.reduce((sum, head) => sum + head.amount, 0);
  } else {
    // Legacy calculation
    this.totalAmount = (this.tuitionFee || 0) + (this.transportFee || 0) + (this.examFee || 0) + (this.otherCharges || 0);
  }
  next();
});

// Instance method to get fee head by id
feeStructureSchema.methods.getFeeHead = function(feeHeadId) {
  return this.feeHeads?.find(head => head._id.toString() === feeHeadId.toString());
};

// Static method to find active fee structure for class
feeStructureSchema.statics.findActiveForClass = function(classId, academicSessionId) {
  return this.findOne({
    classId,
    academicSessionId,
    isActive: true,
    isDeleted: { $ne: true },
    $or: [
      { effectiveTill: { $exists: false } },
      { effectiveTill: { $gte: new Date() } }
    ]
  });
};

module.exports = mongoose.model('FeeStructure', feeStructureSchema);