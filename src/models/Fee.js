const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  totalFee: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueAmount: {
    type: Number,
    required: true
  },
  installments: [
    {
      amount: Number,
      date: Date,
      status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Fee', FeeSchema);