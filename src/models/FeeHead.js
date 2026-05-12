const mongoose = require('mongoose');

const feeHeadSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    feeType: {
      type: String,
      enum: ['tuition', 'transport', 'admission', 'exam', 'library', 'laboratory', 'sports', 'other'],
      default: 'other',
    },
    isRefundable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Ensure unique fee head names per school
feeHeadSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('FeeHead', feeHeadSchema);
