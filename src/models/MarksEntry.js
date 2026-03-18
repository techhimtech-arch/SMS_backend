const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const marksEntrySchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    examSubjectPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSubjectPaper',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: [0, 'Marks obtained cannot be negative']
    },
    maxMarks: {
      type: Number,
      required: true,
      min: [1, 'Maximum marks must be at least 1']
    },
    percentage: {
      type: Number,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    grade: {
      type: String,
      trim: true,
      maxlength: [10, 'Grade cannot exceed 10 characters']
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL', 'ABSENT', 'PENDING'],
      default: 'PENDING'
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    teacherRemarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Teacher remarks cannot exceed 500 characters']
    },
    locked: {
      type: Boolean,
      default: false,
    },
    lockedAt: {
      type: Date,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      required: true,
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

// Indexes for performance and uniqueness
marksEntrySchema.index({ 
  examId: 1, 
  studentId: 1, 
  subjectId: 1 
}, { unique: true });

marksEntrySchema.index({ 
  schoolId: 1, 
  examId: 1 
});

marksEntrySchema.index({ 
  schoolId: 1, 
  isDeleted: 1 
});

marksEntrySchema.index({ 
  studentId: 1, 
  examId: 1 
});

marksEntrySchema.index({ 
  subjectId: 1, 
  examId: 1 
});

marksEntrySchema.index({ 
  enteredBy: 1 
});

marksEntrySchema.index({ 
  locked: 1 
});

marksEntrySchema.index({ 
  examId: 1, 
  status: 1 
});

// Apply soft delete filter
addSoftDeleteFilter(marksEntrySchema);

// Static methods for common queries
marksEntrySchema.statics.findByExam = function(examId, schoolId) {
  return this.find({
    examId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'studentId', select: 'admissionNumber firstName lastName' },
    { path: 'subjectId', select: 'name code department' },
    { path: 'enteredBy', select: 'name email' },
    { path: 'lockedBy', select: 'name email' }
  ])
  .sort({ 'studentId.firstName': 1, 'studentId.lastName': 1 });
};

marksEntrySchema.statics.findByStudent = function(studentId, schoolId) {
  return this.find({
    studentId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'examId', select: 'name examType startDate endDate' },
    { path: 'subjectId', select: 'name code department' },
    { path: 'enteredBy', select: 'name email' }
  ])
  .sort({ examId: -1 });
};

marksEntrySchema.statics.findBySubject = function(subjectId, examId, schoolId) {
  return this.find({
    subjectId,
    examId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'studentId', select: 'admissionNumber firstName lastName' },
    { path: 'enteredBy', select: 'name email' }
  ])
  .sort({ 'studentId.firstName': 1, 'studentId.lastName': 1 });
};

marksEntrySchema.statics.checkDuplicateEntry = function(examId, studentId, subjectId, schoolId, excludeId = null) {
  const query = {
    examId,
    studentId,
    subjectId,
    schoolId,
    isDeleted: { $ne: true }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

marksEntrySchema.statics.getExamStatistics = function(examId, schoolId) {
  return this.aggregate([
    {
      $match: {
        examId: new mongoose.Types.ObjectId(examId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: '$subjectId',
        subject: { $first: '$subjectId' },
        totalStudents: { $sum: 1 },
        passedStudents: {
          $sum: {
            $cond: [{ $eq: ['$status', 'PASS'] }, 1, 0]
          }
        },
        failedStudents: {
          $sum: {
            $cond: [{ $eq: ['$status', 'FAIL'] }, 1, 0]
          }
        },
        absentStudents: {
          $sum: {
            $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0]
          }
        },
        averageMarks: { $avg: '$marksObtained' },
        highestMarks: { $max: '$marksObtained' },
        lowestMarks: { $min: '$marksObtained' }
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subject',
        foreignField: '_id',
        as: 'subjectInfo'
      }
    },
    {
      $sort: { 'subjectInfo.name': 1 }
    }
  ]);
};

// Virtual for checking if marks are locked
marksEntrySchema.virtual('isLocked').get(function() {
  return this.locked;
});

// Virtual for checking if marks are passing
marksEntrySchema.virtual('isPassing').get(function() {
  return this.status === 'PASS';
});

// Pre-save middleware for validation and calculations
marksEntrySchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      // Check for duplicate marks entry
      const existingEntry = await this.constructor.checkDuplicateEntry(
        this.examId,
        this.studentId,
        this.subjectId,
        this.schoolId
      );

      if (existingEntry) {
        return next(new Error(`Marks already entered for this student, subject, and exam`));
      }
    }

    // Calculate percentage
    if (this.marksObtained !== undefined && this.maxMarks > 0) {
      this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100 * 100) / 100;
    }

    // Validate marks against max marks
    if (this.marksObtained > this.maxMarks) {
      return next(new Error(`Marks obtained cannot exceed maximum marks (${this.maxMarks})`));
    }

    // Check if marks are being edited after lock
    if (!this.isNew && this.locked) {
      return next(new Error('Cannot edit marks after they have been locked'));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware to prevent editing locked marks
marksEntrySchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  const query = this.getQuery();
  
  // Allow only lock/unlock operations on locked entries
  if (query.locked === true && Object.keys(update).length > 1) {
    return next(new Error('Cannot edit locked marks'));
  }
  
  next();
});

module.exports = mongoose.model('MarksEntry', marksEntrySchema);
