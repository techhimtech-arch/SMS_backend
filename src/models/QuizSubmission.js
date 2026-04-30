const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const quizSubmissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required']
  },
  
  // Quiz Attempt Details
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  sessionTimeout: {
    type: Number, // in minutes (default 30 mins)
    default: 30
  },
  
  // Answers
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number, // Index of selected option
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  
  // Results
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    default: 'F'
  },
  passed: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['STARTED', 'IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT', 'AUTO_SUBMITTED'],
    default: 'STARTED'
  },
  
  // Additional Info
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Soft Delete
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
quizSubmissionSchema.index({ quizId: 1, studentId: 1 });
quizSubmissionSchema.index({ studentId: 1, status: 1 });
quizSubmissionSchema.index({ schoolId: 1, percentage: -1 });
quizSubmissionSchema.index({ quizId: 1, percentage: -1 });
quizSubmissionSchema.index({ isDeleted: 1 });

// Apply soft delete filter
addSoftDeleteFilter(quizSubmissionSchema);

// Virtuals
quizSubmissionSchema.virtual('accuracy').get(function() {
  return this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
});

quizSubmissionSchema.virtual('timeTakenFormatted').get(function() {
  const hours = Math.floor(this.timeTaken / 3600);
  const minutes = Math.floor((this.timeTaken % 3600) / 60);
  const seconds = this.timeTaken % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// Pre-save middleware
quizSubmissionSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.totalMarks > 0) {
    this.percentage = (this.marksObtained / this.totalMarks) * 100;
  }
  
  // Calculate grade
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C+';
  else if (this.percentage >= 40) this.grade = 'C';
  else if (this.percentage >= 33) this.grade = 'D';
  else this.grade = 'F';
  
  // Calculate time taken if submitted
  if (this.submittedAt && this.startedAt) {
    this.timeTaken = Math.floor((this.submittedAt - this.startedAt) / 1000);
  }
  
  next();
});

// Static methods
quizSubmissionSchema.statics.findByStudent = function(studentId, filters = {}) {
  return this.find({
    studentId,
    isDeleted: { $ne: true },
    ...filters
  }).sort({ createdAt: -1 });
};

quizSubmissionSchema.statics.findQuizResults = function(quizId, filters = {}) {
  return this.find({
    quizId,
    status: 'SUBMITTED',
    isDeleted: { $ne: true },
    ...filters
  }).sort({ percentage: -1 });
};

quizSubmissionSchema.statics.getSchoolLeaderboard = function(schoolId, limit = 10) {
  return this.aggregate([
    {
      $match: {
        schoolId: schoolId,
        status: 'SUBMITTED',
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: '$studentId',
        totalQuizzes: { $sum: 1 },
        totalMarks: { $sum: '$marksObtained' },
        averagePercentage: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        lastQuizDate: { $max: '$submittedAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $project: {
        studentId: '$_id',
        studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
        admissionNumber: '$student.admissionNumber',
        totalQuizzes: 1,
        totalMarks: 1,
        averagePercentage: { $round: ['$averagePercentage', 2] },
        bestScore: 1,
        lastQuizDate: 1
      }
    },
    {
      $sort: { averagePercentage: -1, totalMarks: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

quizSubmissionSchema.statics.getQuizLeaderboard = function(quizId, limit = 10) {
  return this.find({
    quizId,
    status: 'SUBMITTED',
    isDeleted: { $ne: true }
  })
  .populate('studentId', 'firstName lastName admissionNumber')
  .sort({ percentage: -1, submittedAt: 1 })
  .limit(limit);
};

// Instance methods
quizSubmissionSchema.methods.calculateResults = function(quiz) {
  let correctCount = 0;
  let totalMarksObtained = 0;
  
  this.answers.forEach(answer => {
    const question = quiz.questions[answer.questionIndex];
    if (question && answer.selectedAnswer === question.correctAnswer) {
      answer.isCorrect = true;
      answer.marksObtained = question.marks;
      correctCount++;
      totalMarksObtained += question.marks;
    } else {
      answer.isCorrect = false;
      answer.marksObtained = 0;
    }
  });
  
  this.correctAnswers = correctCount;
  this.wrongAnswers = this.totalQuestions - correctCount;
  this.marksObtained = totalMarksObtained;
  
  // Check if passed
  this.passed = this.marksObtained >= (quiz.passingMarks || 0);
  
  return this;
};

quizSubmissionSchema.methods.submitQuiz = function() {
  this.status = 'SUBMITTED';
  this.submittedAt = new Date();
  return this.save();
};

quizSubmissionSchema.methods.timeoutQuiz = function() {
  this.status = 'TIMED_OUT';
  this.submittedAt = new Date();
  return this.save();
};

quizSubmissionSchema.methods.autoSubmit = function() {
  this.status = 'AUTO_SUBMITTED';
  this.submittedAt = new Date();
  return this.save();
};

quizSubmissionSchema.methods.softDelete = async function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
