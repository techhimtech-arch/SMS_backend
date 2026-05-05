const mongoose = require('mongoose');

const refactoredExamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    exam_type: {
      type: String,
      required: true,
    },
    // Adding schoolId for multi-tenant support common in this codebase
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      }
    ],
    subjects: [
      {
        subject_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        max_marks: {
          type: Number,
          required: true,
          min: [1, 'Maximum marks must be at least 1'],
        }
      }
    ]
  },
  {
    timestamps: true, // Auto adds created_at and updated_at
  }
);

// Ensuring an exam name is unique per class per school
refactoredExamSchema.index({ schoolId: 1, class_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Exam', refactoredExamSchema);
