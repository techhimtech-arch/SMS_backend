const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const examSubjectPaperSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: [1, 'Maximum marks must be at least 1'],
      max: [1000, 'Maximum marks cannot exceed 1000']
    },
    passingMarks: {
      type: Number,
      required: true,
      min: [0, 'Passing marks cannot be negative'],
      validate: {
        validator: function(v) {
          return v <= this.maxMarks;
        },
        message: 'Passing marks cannot exceed maximum marks'
      }
    },
    examDate: {
      type: Date,
      required: true,
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
    duration: {
      type: Number, // in minutes
      min: [1, 'Duration must be at least 1 minute']
    },
    venue: {
      type: String,
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters']
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters']
    },
    paperPattern: {
      type: String,
      trim: true,
      maxlength: [1000, 'Paper pattern cannot exceed 1000 characters']
    },
    totalQuestions: {
      type: Number,
      min: [1, 'Total questions must be at least 1']
    },
    compulsoryQuestions: {
      type: Number,
      min: [1, 'Compulsory questions must be at least 1']
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
examSubjectPaperSchema.index({ 
  examId: 1, 
  subjectId: 1 
}, { unique: true });

examSubjectPaperSchema.index({ 
  schoolId: 1, 
  examId: 1 
});

examSubjectPaperSchema.index({ 
  schoolId: 1, 
  isDeleted: 1 
});

examSubjectPaperSchema.index({ 
  teacherId: 1, 
  examDate: 1 
});

examSubjectPaperSchema.index({ 
  examId: 1, 
  examDate: 1 
});

examSubjectPaperSchema.index({ 
  createdBy: 1 
});

// Apply soft delete filter
addSoftDeleteFilter(examSubjectPaperSchema);

// Static methods for common queries
examSubjectPaperSchema.statics.findByExam = function(examId, schoolId) {
  return this.find({
    examId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'subjectId', select: 'name code department' },
    { path: 'teacherId', select: 'name email' },
    { path: 'createdBy', select: 'name email' }
  ])
  .sort({ examDate: 1, startTime: 1 });
};

examSubjectPaperSchema.statics.findByTeacher = function(teacherId, schoolId) {
  return this.find({
    teacherId,
    schoolId,
    isDeleted: { $ne: true }
  })
  .populate([
    { path: 'examId', select: 'name examType startDate endDate' },
    { path: 'subjectId', select: 'name code department' }
  ])
  .sort({ examDate: -1 });
};

examSubjectPaperSchema.statics.checkSubjectAssignment = function(examId, subjectId, schoolId, excludeId = null) {
  const query = {
    examId,
    subjectId,
    schoolId,
    isDeleted: { $ne: true }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.findOne(query);
};

// Virtual for checking if paper is scheduled for today
examSubjectPaperSchema.virtual('isToday').get(function() {
  const today = new Date();
  return this.examDate.toDateString() === today.toDateString();
});

// Virtual for checking if paper is in the past
examSubjectPaperSchema.virtual('isPast').get(function() {
  return this.examDate < new Date();
});

// Pre-save middleware for validation
examSubjectPaperSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      // Check for duplicate subject assignment in same exam
      const existingAssignment = await this.constructor.checkSubjectAssignment(
        this.examId,
        this.subjectId,
        this.schoolId
      );

      if (existingAssignment) {
        return next(new Error(`Subject is already assigned to this exam`));
      }
    }

    // Validate time format
    if (this.startTime && this.endTime) {
      const start = new Date(`2000-01-01T${this.startTime}:00`);
      const end = new Date(`2000-01-01T${this.endTime}:00`);
      
      if (start >= end) {
        return next(new Error('End time must be after start time'));
      }

      // Calculate duration if not provided
      if (!this.duration) {
        this.duration = Math.round((end - start) / (1000 * 60));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('ExamSubjectPaper', examSubjectPaperSchema);
