const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const feeItemSchema = new mongoose.Schema({
  feeHeadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Fee head ID is required']
  },
  feeHeadName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: [0, 'Fee amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  dueAmount: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'],
    default: 'PENDING'
  },
  frequency: {
    type: String,
    enum: ['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'],
    default: 'YEARLY'
  },
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  quarter: {
    type: Number,
    min: 1,
    max: 4
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: true });

// Pre-save middleware to calculate dueAmount
feeItemSchema.pre('save', function(next) {
  this.dueAmount = Math.max(0, this.amount - this.paidAmount);

  // Auto-update status based on payment
  if (this.paidAmount >= this.amount) {
    this.status = 'PAID';
  } else if (this.paidAmount > 0) {
    this.status = 'PARTIAL';
  } else if (this.dueDate < new Date() && this.status !== 'WAIVED') {
    this.status = 'OVERDUE';
  }
  next();
});

const studentFeeSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    // Keep studentId for backward compatibility
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
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
    feeItems: {
      type: [feeItemSchema],
      default: []
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      required: true,
    },
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
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
studentFeeSchema.index({ enrollmentId: 1, academicYearId: 1, schoolId: 1 }, { unique: true });
studentFeeSchema.index({ studentId: 1, academicYearId: 1, schoolId: 1 }, { unique: true, sparse: true }); // Legacy support
studentFeeSchema.index({ studentId: 1, academicYearId: 1 });
studentFeeSchema.index({ 'feeItems.status': 1, 'feeItems.dueDate': 1 });
studentFeeSchema.index({ isDeleted: 1 });

// Apply soft delete filter
addSoftDeleteFilter(studentFeeSchema);

// Pre-save middleware to calculate totals
studentFeeSchema.pre('save', function(next) {
  if (this.feeItems && this.feeItems.length > 0) {
    this.totalAmount = this.feeItems.reduce((sum, item) => sum + item.amount, 0);
    this.paidAmount = this.feeItems.reduce((sum, item) => sum + item.paidAmount, 0);
    this.balanceAmount = this.totalAmount - this.paidAmount;
  }
  next();
});

// Virtual for fee summary
studentFeeSchema.virtual('feeSummary').get(function() {
  const summary = {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    waived: 0
  };

  if (this.feeItems && this.feeItems.length > 0) {
    this.feeItems.forEach(item => {
      summary.total += item.amount;
      summary.paid += item.paidAmount;

      switch (item.status) {
        case 'PENDING':
          summary.pending += item.dueAmount;
          break;
        case 'OVERDUE':
          summary.overdue += item.dueAmount;
          break;
        case 'WAIVED':
          summary.waived += item.dueAmount;
          break;
      }
    });
  }

  return summary;
});

// Instance method to get fee item by id
studentFeeSchema.methods.getFeeItem = function(feeItemId) {
  return this.feeItems?.find(item => item._id.toString() === feeItemId.toString());
};

// Instance method to add payment to fee item
studentFeeSchema.methods.addPayment = async function(feeItemId, amount) {
  const feeItem = this.feeItems.id(feeItemId);
  if (!feeItem) {
    throw new Error('Fee item not found');
  }

  if (amount > feeItem.dueAmount) {
    throw new Error('Payment amount exceeds due amount');
  }

  feeItem.paidAmount += amount;
  feeItem.dueAmount = feeItem.amount - feeItem.paidAmount;

  if (feeItem.paidAmount >= feeItem.amount) {
    feeItem.status = 'PAID';
  } else if (feeItem.paidAmount > 0) {
    feeItem.status = 'PARTIAL';
  }

  return this.save();
};

// Static method to find by student and session
studentFeeSchema.statics.findByStudentAndSession = function(studentId, academicYearId) {
  return this.findOne({
    studentId,
    academicYearId,
    isDeleted: { $ne: true }
  });
};

// Static method to find students with overdue fees
studentFeeSchema.statics.findOverdueFees = function(academicYearId, schoolId = null) {
  const query = {
    academicYearId,
    isDeleted: { $ne: true },
    'feeItems.status': 'OVERDUE'
  };

  if (schoolId) {
    query.schoolId = schoolId;
  }

  return this.find(query);
};

module.exports = mongoose.model('StudentFee', studentFeeSchema);