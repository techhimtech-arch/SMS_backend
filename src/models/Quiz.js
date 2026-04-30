const mongoose = require('mongoose');
const { addSoftDeleteFilter } = require('../utils/softDelete');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
    // Optional for school-wide quizzes
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
    // Optional for school-wide quizzes
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School ID is required']
  },
  
  // Quiz Configuration
  quizType: {
    type: String,
    enum: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'MIXED'],
    default: 'MCQ'
  },
  timeLimit: {
    type: Number, // in minutes
    required: [true, 'Time limit is required'],
    min: [1, 'Time limit must be at least 1 minute'],
    max: [180, 'Time limit cannot exceed 3 hours']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: [1, 'Maximum marks must be at least 1']
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks is required'],
    min: [0, 'Passing marks cannot be negative']
  },
  
  // Questions Array
  questions: [{
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    options: [{
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Option cannot exceed 200 characters']
    }],
    correctAnswer: {
      type: Number, // Index of correct option (0, 1, 2, 3...)
      required: [true, 'Correct answer is required'],
      min: 0
    },
    marks: {
      type: Number,
      required: [true, 'Question marks is required'],
      min: [1, 'Question marks must be at least 1']
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [500, 'Explanation cannot exceed 500 characters']
    }
  }],
  
  // Quiz Status and Timing
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED', 'CANCELLED'],
    default: 'DRAFT'
  },
  publishedAt: {
    type: Date
  },
  startsAt: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endsAt: {
    type: Date,
    required: [true, 'End time is required']
  },
  
  // Quiz Settings
  allowRetake: {
    type: Boolean,
    default: false
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showResultsImmediately: {
    type: Boolean,
    default: true
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  
  // School-wide Quiz
  isSchoolWide: {
    type: Boolean,
    default: false
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
quizSchema.index({ schoolId: 1, status: 1 });
quizSchema.index({ teacherId: 1, status: 1 });
quizSchema.index({ classId: 1, sectionId: 1, status: 1 });
quizSchema.index({ startsAt: 1, endsAt: 1 });
quizSchema.index({ isDeleted: 1 });

// Apply soft delete filter
addSoftDeleteFilter(quizSchema);

// Virtuals
quizSchema.virtual('totalQuestions').get(function() {
  return this.questions.length;
});

quizSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'PUBLISHED' && 
         this.startsAt <= now && 
         this.endsAt >= now;
});

quizSchema.virtual('isEnded').get(function() {
  return new Date() > this.endsAt;
});

// Virtual for quiz submissions
quizSchema.virtual('submissions', {
  ref: 'QuizSubmission',
  localField: '_id',
  foreignField: 'quizId',
  count: true,
  match: { isDeleted: { $ne: true } }
});

// Pre-save middleware
quizSchema.pre('save', function(next) {
  // Validate end time is after start time
  if (this.endsAt <= this.startsAt) {
    return next(new Error('End time must be after start time'));
  }
  
  // Calculate total marks from questions if not provided
  if (this.isNew && !this.maxMarks) {
    this.maxMarks = this.questions.reduce((total, q) => total + q.marks, 0);
  }
  
  // Validate passing marks
  if (this.passingMarks > this.maxMarks) {
    return next(new Error('Passing marks cannot exceed maximum marks'));
  }
  
  // Set publishedAt when status changes to PUBLISHED
  if (this.isModified('status') && this.status === 'PUBLISHED' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static methods
quizSchema.statics.findActiveForClass = function(classId, sectionId) {
  const now = new Date();
  return this.find({
    classId,
    sectionId,
    status: 'PUBLISHED',
    startsAt: { $lte: now },
    endsAt: { $gte: now },
    isDeleted: { $ne: true }
  }).sort({ startsAt: 1 });
};

quizSchema.statics.findSchoolWide = function(schoolId) {
  const now = new Date();
  return this.find({
    schoolId,
    isSchoolWide: true,
    status: 'PUBLISHED',
    startsAt: { $lte: now },
    endsAt: { $gte: now },
    isDeleted: { $ne: true }
  }).sort({ startsAt: 1 });
};

quizSchema.statics.findByTeacher = function(teacherId, filters = {}) {
  return this.find({
    teacherId,
    isDeleted: { $ne: true },
    ...filters
  }).sort({ createdAt: -1 });
};

// Instance methods
quizSchema.methods.publish = async function() {
  this.status = 'PUBLISHED';
  this.publishedAt = new Date();
  return this.save();
};

quizSchema.methods.startQuiz = async function() {
  this.status = 'ACTIVE';
  return this.save();
};

quizSchema.methods.endQuiz = async function() {
  this.status = 'ENDED';
  return this.save();
};

quizSchema.methods.softDelete = async function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

quizSchema.methods.getQuestionsForStudent = function(studentId = null) {
  let questions = [...this.questions];
  
  // Randomize questions if enabled
  if (this.randomizeQuestions && studentId) {
    questions = questions.sort(() => Math.random() - 0.5);
  }
  
  // Randomize options if enabled
  if (this.randomizeOptions && studentId) {
    questions = questions.map(q => {
      const optionsWithIndex = q.options.map((option, index) => ({
        text: option,
        originalIndex: index
      }));
      
      const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5);
      
      return {
        ...q.toObject(),
        options: shuffledOptions.map(opt => opt.text)
        // ✅ correctAnswer removed from response
      };
    });
  }
  
  // ✅ SECURITY: Remove correctAnswer from all questions before returning
  // Students should NEVER see correct answers before submission
  questions = questions.map(q => {
    const questionObj = q.toObject ? q.toObject() : q;
    const { correctAnswer, ...safeQuestion } = questionObj;
    return safeQuestion;
  });
  
  return questions;
};

module.exports = mongoose.model('Quiz', quizSchema);
