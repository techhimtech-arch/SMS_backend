const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const User = require('../models/User');
const TeacherAssignment = require('../models/TeacherAssignment');
const auditLogger = require('../utils/auditLogger');
const logger = require('../utils/logger');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Create new quiz
 * @route   POST /api/v1/teacher/quizzes
 * @access  Private (Teacher)
 */
exports.createQuiz = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    subjectId,
    classId,
    sectionId,
    quizType,
    timeLimit,
    maxMarks,
    passingMarks,
    questions,
    startsAt,
    endsAt,
    allowRetake,
    maxAttempts,
    showCorrectAnswers,
    showResultsImmediately,
    randomizeQuestions,
    randomizeOptions,
    isSchoolWide
  } = req.body;

  // Validate teacher permission
  if (!isSchoolWide) {
    const hasPermission = await TeacherAssignment.findOne({
      teacherId: req.user.userId,
      subjectId,
      classId,
      sectionId,
      schoolId: req.user.schoolId,
      isActive: true
    });

    if (!hasPermission) {
      return next(new ErrorResponse('You do not have permission to create quiz for this class/section', 403));
    }
  }

  // Validate questions
  if (!questions || questions.length === 0) {
    return next(new ErrorResponse('At least one question is required', 400));
  }

  // Validate total marks
  const calculatedMaxMarks = questions.reduce((total, q) => total + q.marks, 0);
  if (maxMarks && maxMarks !== calculatedMaxMarks) {
    return next(new ErrorResponse(`Max marks must be ${calculatedMaxMarks} based on question marks`, 400));
  }

  const quiz = new Quiz({
    title,
    description,
    subjectId,
    classId,
    sectionId,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    quizType,
    timeLimit,
    maxMarks: calculatedMaxMarks,
    passingMarks,
    questions,
    startsAt,
    endsAt,
    allowRetake,
    maxAttempts,
    showCorrectAnswers,
    showResultsImmediately,
    randomizeQuestions,
    randomizeOptions,
    isSchoolWide,
    createdBy: req.user.userId
  });

  await quiz.save();

  // Log audit
  await auditLogger.log({
    action: 'QUIZ_CREATE',
    userId: req.user.userId,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    details: {
      quizId: quiz._id,
      title: quiz.title,
      classId,
      sectionId,
      subjectId
    }
  });

  logger.info('Quiz created successfully', {
    quizId: quiz._id,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  });

  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: quiz
  });
});

/**
 * @desc    Get teacher's quizzes
 * @route   GET /api/v1/teacher/quizzes
 * @access  Private (Teacher)
 */
exports.getTeacherQuizzes = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status, classId, sectionId } = req.query;

  const filters = {
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  };

  if (status) filters.status = status;
  if (classId) filters.classId = classId;
  if (sectionId) filters.sectionId = sectionId;

  const quizzes = await Quiz.find(filters)
    .populate('subjectId', 'name')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Quiz.countDocuments(filters);

  res.status(200).json({
    success: true,
    data: quizzes,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuizzes: total
    }
  });
});

/**
 * @desc    Get quiz details
 * @route   GET /api/v1/teacher/quizzes/:id
 * @access  Private (Teacher)
 */
exports.getQuizDetails = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  })
  .populate('subjectId', 'name')
  .populate('classId', 'name')
  .populate('sectionId', 'name');

  if (!quiz) {
    return next(new ErrorResponse('Quiz not found', 404));
  }

  // Get quiz statistics
  const stats = await QuizSubmission.aggregate([
    {
      $match: {
        quizId: quiz._id,
        status: 'SUBMITTED',
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
        highestScore: { $max: '$percentage' },
        lowestScore: { $min: '$percentage' },
        passedCount: {
          $sum: { $cond: ['$passed', 1, 0] }
        }
      }
    }
  ]);

  const quizStats = stats[0] || {
    totalSubmissions: 0,
    averagePercentage: 0,
    highestScore: 0,
    lowestScore: 0,
    passedCount: 0
  };

  res.status(200).json({
    success: true,
    data: {
      quiz,
      stats: quizStats
    }
  });
});

/**
 * @desc    Update quiz
 * @route   PUT /api/v1/teacher/quizzes/:id
 * @access  Private (Teacher)
 */
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  });

  if (!quiz) {
    return next(new ErrorResponse('Quiz not found', 404));
  }

  // Don't allow updates if quiz is already published
  if (quiz.status === 'PUBLISHED') {
    return next(new ErrorResponse('Cannot update published quiz', 400));
  }

  const {
    title,
    description,
    timeLimit,
    passingMarks,
    questions,
    startsAt,
    endsAt,
    allowRetake,
    maxAttempts,
    showCorrectAnswers,
    showResultsImmediately,
    randomizeQuestions,
    randomizeOptions
  } = req.body;

  // Update fields
  if (title) quiz.title = title;
  if (description !== undefined) quiz.description = description;
  if (timeLimit) quiz.timeLimit = timeLimit;
  if (passingMarks) quiz.passingMarks = passingMarks;
  if (questions) {
    quiz.questions = questions;
    quiz.maxMarks = questions.reduce((total, q) => total + q.marks, 0);
  }
  if (startsAt) quiz.startsAt = startsAt;
  if (endsAt) quiz.endsAt = endsAt;
  if (allowRetake !== undefined) quiz.allowRetake = allowRetake;
  if (maxAttempts) quiz.maxAttempts = maxAttempts;
  if (showCorrectAnswers !== undefined) quiz.showCorrectAnswers = showCorrectAnswers;
  if (showResultsImmediately !== undefined) quiz.showResultsImmediately = showResultsImmediately;
  if (randomizeQuestions !== undefined) quiz.randomizeQuestions = randomizeQuestions;
  if (randomizeOptions !== undefined) quiz.randomizeOptions = randomizeOptions;

  quiz.updatedBy = req.user.userId;
  await quiz.save();

  // Log audit
  await auditLogger.log({
    action: 'QUIZ_UPDATE',
    userId: req.user.userId,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    details: {
      quizId: quiz._id,
      title: quiz.title
    }
  });

  res.status(200).json({
    success: true,
    message: 'Quiz updated successfully',
    data: quiz
  });
});

/**
 * @desc    Publish quiz
 * @route   POST /api/v1/teacher/quizzes/:id/publish
 * @access  Private (Teacher)
 */
exports.publishQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  });

  if (!quiz) {
    return next(new ErrorResponse('Quiz not found', 404));
  }

  if (quiz.status !== 'DRAFT') {
    return next(new ErrorResponse('Only draft quizzes can be published', 400));
  }

  await quiz.publish();

  // Log audit
  await auditLogger.log({
    action: 'QUIZ_PUBLISH',
    userId: req.user.userId,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    details: {
      quizId: quiz._id,
      title: quiz.title,
      startsAt: quiz.startsAt,
      endsAt: quiz.endsAt
    }
  });

  res.status(200).json({
    success: true,
    message: 'Quiz published successfully',
    data: quiz
  });
});

/**
 * @desc    Delete quiz
 * @route   DELETE /api/v1/teacher/quizzes/:id
 * @access  Private (Teacher)
 */
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  });

  if (!quiz) {
    return next(new ErrorResponse('Quiz not found', 404));
  }

  // Don't allow deletion if quiz has submissions
  const submissionCount = await QuizSubmission.countDocuments({
    quizId: quiz._id,
    isDeleted: { $ne: true }
  });

  if (submissionCount > 0) {
    return next(new ErrorResponse('Cannot delete quiz with submissions', 400));
  }

  await quiz.softDelete(req.user.userId);

  // Log audit
  await auditLogger.log({
    action: 'QUIZ_DELETE',
    userId: req.user.userId,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    details: {
      quizId: quiz._id,
      title: quiz.title
    }
  });

  res.status(200).json({
    success: true,
    message: 'Quiz deleted successfully'
  });
});

/**
 * @desc    Get quiz results
 * @route   GET /api/v1/teacher/quizzes/:id/results
 * @access  Private (Teacher)
 */
exports.getQuizResults = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50 } = req.query;

  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  });

  if (!quiz) {
    return next(new ErrorResponse('Quiz not found', 404));
  }

  const submissions = await QuizSubmission.findQuizResults(quiz._id)
    .populate('studentId', 'firstName lastName admissionNumber')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await QuizSubmission.countDocuments({
    quizId: quiz._id,
    status: 'SUBMITTED',
    isDeleted: { $ne: true }
  });

  res.status(200).json({
    success: true,
    data: {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        maxMarks: quiz.maxMarks,
        passingMarks: quiz.passingMarks,
        totalQuestions: quiz.totalQuestions
      },
      submissions
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSubmissions: total
    }
  });
});

/**
 * @desc    Get quiz leaderboard
 * @route   GET /api/v1/teacher/quizzes/:id/leaderboard
 * @access  Private (Teacher)
 */
exports.getQuizLeaderboard = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId
  });

  if (!quiz) {
    return next(new ErrorResponse('Quiz not found', 404));
  }

  const leaderboard = await QuizSubmission.getQuizLeaderboard(quiz._id, parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        maxMarks: quiz.maxMarks
      },
      leaderboard
    }
  });
});

/**
 * @desc    Get school-wide leaderboard
 * @route   GET /api/v1/teacher/leaderboard
 * @access  Private (Teacher)
 */
exports.getSchoolLeaderboard = asyncHandler(async (req, res, next) => {
  const { limit = 20 } = req.query;

  const leaderboard = await QuizSubmission.getSchoolLeaderboard(req.user.schoolId, parseInt(limit));

  res.status(200).json({
    success: true,
    data: leaderboard
  });
});
