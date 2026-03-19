const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const feePaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true
    },
    studentFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentFee',
      required: [true, 'Student fee ID is required']
    },
    feeItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Fee item ID is required'],
      index: true
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true
    },
    // Legacy support
    academicYear: {
      type: String,
    },
    amountPaid: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    // Legacy field
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative']
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    paymentMode: {
      type: String,
      enum: ['CASH', 'ONLINE', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE', 'Cash', 'UPI', 'Bank'],
      required: [true, 'Payment mode is required']
    },
    transactionId: {
      type: String,
      trim: true
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Legacy field
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    feeHeadName: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'SUCCESS'
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    refundDate: {
      type: Date
    },
    refundReason: {
      type: String,
      trim: true
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
feePaymentSchema.index({ studentId: 1, academicSessionId: 1 });
feePaymentSchema.index({ studentFeeId: 1 });
feePaymentSchema.index({ feeItemId: 1 });
feePaymentSchema.index({ receiptNumber: 1 }, { unique: true, sparse: true });
feePaymentSchema.index({ paymentDate: -1 });
feePaymentSchema.index({ status: 1 });
feePaymentSchema.index({ isDeleted: 1 });

// Apply soft delete filter
addSoftDeleteFilter(feePaymentSchema);

// Pre-save middleware to ensure amountPaid is set
feePaymentSchema.pre('save', function(next) {
  if (!this.amountPaid && this.amount) {
    this.amountPaid = this.amount;
  }
  next();
});

// Virtual for net amount (after refund)
feePaymentSchema.virtual('netAmount').get(function() {
  return this.amountPaid - (this.refundAmount || 0);
});

// Instance method to process refund
feePaymentSchema.methods.processRefund = async function(refundAmount, reason, userId) {
  if (refundAmount > this.amountPaid) {
    throw new Error('Refund amount cannot exceed payment amount');
  }

  this.refundAmount = refundAmount;
  this.refundDate = new Date();
  this.refundReason = reason;
  this.status = refundAmount >= this.amountPaid ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
  this.updatedBy = userId;

  return this.save();
};

// Static method to generate receipt number
feePaymentSchema.statics.generateReceiptNumber = async function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Find count of payments today for sequential number
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const count = await this.countDocuments({
    paymentDate: { $gte: startOfDay, $lt: endOfDay }
  });

  const sequential = String(count + 1).padStart(4, '0');
  return `RCPT${year}${month}${day}${sequential}`;
};

// Static method to get payment summary for student
feePaymentSchema.statics.getPaymentSummary = async function(studentId, academicSessionId) {
  const result = await this.aggregate([
    {
      $match: {
        studentId: new mongoose.Types.ObjectId(studentId),
        academicSessionId: new mongoose.Types.ObjectId(academicSessionId),
        status: { $in: ['SUCCESS', 'PARTIALLY_REFUNDED'] },
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amountPaid' },
        totalRefunded: { $sum: '$refundAmount' },
        paymentCount: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { totalPaid: 0, totalRefunded: 0, paymentCount: 0 };
};

module.exports = mongoose.model('FeePayment', feePaymentSchema);