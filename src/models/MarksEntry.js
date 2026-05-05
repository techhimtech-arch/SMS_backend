const mongoose = require('mongoose');

const refactoredMarkSchema = new mongoose.Schema(
  {
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    enrollment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    marks_obtained: {
      type: Number,
      required: true,
      min: [0, 'Marks obtained cannot be negative'],
    }
  },
  {
    timestamps: true,
  }
);

// UNIQUE(exam_id, enrollment_id, subject_id)
refactoredMarkSchema.index(
  { exam_id: 1, enrollment_id: 1, subject_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('MarksEntry', refactoredMarkSchema);
