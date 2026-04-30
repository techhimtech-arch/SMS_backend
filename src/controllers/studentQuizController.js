const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get available quizzes for student
 * @route   GET /api/v1/student/quizzes
 * @access  Private (Student)
 */
exports.getAvailableQuizzes = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  // Get student profile first (since enrollment uses studentId which is StudentProfile._id, not User._id)
  const studentProfile = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!studentProfile) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get student's enrollment using StudentProfile ID
  const enrollment = await Enrollment.findOne({
    studentId: studentProfile._id,
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  }).populate('classId sectionId');

  if (!enrollment) {
    return next(new ErrorResponse('Student enrollment not found', 404));
  }

  // Get class quizzes
  const classQuizzes = await Quiz.findActiveForClass(
    enrollment.classId._id,
    enrollment.sectionId._id
  )
  .populate('subjectId', 'name')
  .populate('teacherId', 'firstName lastName')
  .sort({ startsAt: 1 });

  // Get school-wide quizzes
  const schoolQuizzes = await Quiz.findSchoolWide(req.user.schoolId)
  .populate('subjectId', 'name')
  .populate('teacherId', 'firstName lastName')
  .sort({ startsAt: 1 });

  // Combine and remove duplicates
  const allQuizzes = [...classQuizzes, ...schoolQuizzes];
  const uniqueQuizzes = allQuizzes.filter((quiz, index, self) =>
    index === self.findIndex((q) => q._id.toString() === quiz._id.toString())
  );

  // Get student's submissions for these quizzes
  const quizIds = uniqueQuizzes.map(q => q._id);
  const submissions = await QuizSubmission.find({
    quizId: { $in: quizIds },
    studentId: studentProfile._id,
    isDeleted: { $ne: true }
  });

  // Add submission status to each quiz
  const quizzesWithStatus = uniqueQuizzes.map(quiz => {
    const quizSubmissions = submissions.filter(s => s.quizId.toString() === quiz._id.toString());
    const bestSubmission = quizSubmissions.reduce((best, current) => 
      (current.percentage > (best?.percentage || 0)) ? current : best, null
    );

    return {
      ...quiz.toObject(),
      submissionStatus: quizSubmissions.length > 0 ? 'ATTEMPTED' : 'NOT_ATTEMPTED',
      attempts: quizSubmissions.length,
      bestScore: bestSubmission?.percentage || 0,
      bestGrade: bestSubmission?.grade || 'F',
      canRetake: quiz.allowRetake && (quizSubmissions.length < quiz.maxAttempts),
      nextAttemptAvailable: quizSubmissions.length < quiz.maxAttempts
    };
  });

  const startIndex = (page - 1) * limit;
  const paginatedQuizzes = quizzesWithStatus.slice(startIndex, startIndex + limit);

  res.status(200).json({
    success: true,
    data: paginatedQuizzes,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(quizzesWithStatus.length / limit),
      totalQuizzes: quizzesWithStatus.length
    }
  });
});

/**
 * @desc    Start quiz
 * @route   POST /api/v1/student/quizzes/:id/start
 * @access  Private (Student)
 */
exports.startQuiz = asyncHandler(async (req, res, next) => {
  // Get student profile first
  const studentProfile = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!studentProfile) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ErrorResponse('Quiz not found', 404));
  }

  // Check if quiz is active
  if (!quiz.isActive) {
    return next(new ErrorResponse('Quiz is not active', 400));
  }

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    studentId: studentProfile._id,
    classId: quiz.classId,
    sectionId: quiz.sectionId,
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  });

  if (!enrollment && !quiz.isSchoolWide) {
    return next(new ErrorResponse('You are not enrolled in this class', 403));
  }

  // Check previous attempts
  const previousAttempts = await QuizSubmission.countDocuments({
    quizId: quiz._id,
    studentId: studentProfile._id,
    isDeleted: { $ne: true }
  });

  if (previousAttempts >= quiz.maxAttempts) {
    return next(new ErrorResponse('Maximum attempts reached', 400));
  }

  // Check if there's an ongoing attempt
  const ongoingAttempt = await QuizSubmission.findOne({
    quizId: quiz._id,
    studentId: studentProfile._id,
    status: { $in: ['STARTED', 'IN_PROGRESS'] },
    isDeleted: { $ne: true }
  });

  // If there's an ongoing attempt, handle session recovery
  if (ongoingAttempt) {
    const timeoutMinutes = ongoingAttempt.sessionTimeout || 30;
    const lastActivity = new Date(ongoingAttempt.lastActivityAt || ongoingAttempt.startedAt);
    const minutesElapsed = (new Date() - lastActivity) / (1000 * 60);

    // If session is stale (no activity for timeout period), auto-submit and allow new attempt
    if (minutesElapsed > timeoutMinutes) {
      // Calculate and finalize the stale session
      ongoingAttempt.calculateResults(quiz);
      ongoingAttempt.status = 'TIMED_OUT';
      ongoingAttempt.submittedAt = new Date();
      const timeTakenSeconds = Math.floor((new Date() - ongoingAttempt.startedAt) / 1000);
      ongoingAttempt.timeTaken = timeTakenSeconds;
      
      await ongoingAttempt.save();
      
      logger.info('Stale quiz session auto-submitted', {
        quizId: quiz._id,
        studentId: req.user.userId,
        minutesElapsed: minutesElapsed.toFixed(2),
        marksObtained: ongoingAttempt.marksObtained,
        status: 'TIMED_OUT'
      });
      
      // Continue to create new submission below
    } else {
      // Session is still active - allow resume
      const questions = quiz.getQuestionsForStudent(studentProfile._id);
      
      // Update lastActivityAt
      ongoingAttempt.lastActivityAt = new Date();
      await ongoingAttempt.save();

      logger.info('Quiz session resumed', {
        quizId: quiz._id,
        studentId: req.user.userId,
        minutesElapsed: minutesElapsed.toFixed(2)
      });

      return res.status(200).json({
        success: true,
        message: 'Quiz resumed successfully',
        data: {
          submissionId: ongoingAttempt._id,
          isResumed: true,
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            timeLimit: quiz.timeLimit,
            maxMarks: quiz.maxMarks,
            passingMarks: quiz.passingMarks,
            showCorrectAnswers: quiz.showCorrectAnswers,
            showResultsImmediately: quiz.showResultsImmediately
          },
          questions,
          timeRemaining: Math.max(0, (quiz.timeLimit * 60) - Math.floor((new Date() - ongoingAttempt.startedAt) / 1000)),
          startedAt: ongoingAttempt.startedAt,
          resumedAt: new Date()
        }
      });
    }
  }

  // Get questions for student (with randomization if enabled)
  const questions = quiz.getQuestionsForStudent(studentProfile._id);

  // Create new submission
  const submission = new QuizSubmission({
    quizId: quiz._id,
    studentId: studentProfile._id,
    schoolId: req.user.schoolId,
    attemptNumber: previousAttempts + 1,
    totalQuestions: questions.length,
    totalMarks: quiz.maxMarks,
    answers: questions.map((q, index) => ({
      questionIndex: index,
      selectedAnswer: null,
      isCorrect: false,
      marksObtained: 0,
      timeSpent: 0
    })),
    status: 'STARTED',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    createdBy: req.user.userId
  });

  await submission.save();

  logger.info('Quiz started', {
    quizId: quiz._id,
    studentId: req.user.userId,
    attemptNumber: submission.attemptNumber
  });

  res.status(200).json({
    success: true,
    message: 'Quiz started successfully',
    data: {
      submissionId: submission._id,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        maxMarks: quiz.maxMarks,
        passingMarks: quiz.passingMarks,
        showCorrectAnswers: quiz.showCorrectAnswers,
        showResultsImmediately: quiz.showResultsImmediately
      },
      questions,
      timeRemaining: quiz.timeLimit * 60, // in seconds
      startedAt: submission.startedAt
    }
  });
});

/**
 * @desc    Submit quiz answer
 * @route   POST /api/v1/student/quizzes/:id/answer
 * @access  Private (Student)
 */
exports.submitAnswer = asyncHandler(async (req, res, next) => {
  const { questionIndex, selectedAnswer } = req.body;

  // Get student profile first
  const studentProfile = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!studentProfile) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  const submission = await QuizSubmission.findOne({
    quizId: req.params.id,
    studentId: studentProfile._id,
    status: { $in: ['STARTED', 'IN_PROGRESS'] },
    isDeleted: { $ne: true }
  });

  if (!submission) {
    return next(new ErrorResponse('No active quiz attempt found', 404));
  }

  // Check if time limit exceeded
  const quiz = await Quiz.findById(req.params.id);
  const timeElapsed = Math.floor((new Date() - submission.startedAt) / 1000);
  
  if (timeElapsed >= quiz.timeLimit * 60) {
    await submission.timeoutQuiz();
    return next(new ErrorResponse('Quiz time limit exceeded', 400));
  }

  // Update answer
  const answerIndex = submission.answers.findIndex(a => a.questionIndex === questionIndex);
  if (answerIndex !== -1) {
    submission.answers[answerIndex].selectedAnswer = selectedAnswer;
    submission.answers[answerIndex].timeSpent = timeElapsed - 
      submission.answers.slice(0, answerIndex).reduce((total, a) => total + a.timeSpent, 0);
    submission.status = 'IN_PROGRESS';
    submission.lastActivityAt = new Date(); // Track activity
    await submission.save();
  }

  res.status(200).json({
    success: true,
    message: 'Answer saved successfully',
    data: {
      timeRemaining: Math.max(0, (quiz.timeLimit * 60) - timeElapsed)
    }
  });
});

/**
 * @desc    Submit quiz
 * @route   POST /api/v1/student/quizzes/:id/submit
 * @access  Private (Student)
 */
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  // Get student profile first
  const studentProfile = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!studentProfile) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  const submission = await QuizSubmission.findOne({
    quizId: req.params.id,
    studentId: studentProfile._id,
    status: { $in: ['STARTED', 'IN_PROGRESS'] },
    isDeleted: { $ne: true }
  }).populate('quizId');

  if (!submission) {
    return next(new ErrorResponse('No active quiz attempt found', 404));
  }

  const quiz = await Quiz.findById(req.params.id);

  // Calculate results
  submission.calculateResults(quiz);
  await submission.submitQuiz();

  logger.info('Quiz submitted', {
    quizId: quiz._id,
    studentId: studentProfile._id,
    attemptNumber: submission.attemptNumber,
    marksObtained: submission.marksObtained,
    percentage: submission.percentage
  });

  res.status(200).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: {
      submissionId: submission._id,
      results: {
        totalQuestions: submission.totalQuestions,
        correctAnswers: submission.correctAnswers,
        wrongAnswers: submission.wrongAnswers,
        totalMarks: submission.totalMarks,
        marksObtained: submission.marksObtained,
        percentage: submission.percentage,
        grade: submission.grade,
        passed: submission.passed,
        timeTaken: submission.timeTakenFormatted,
        answers: quiz.showCorrectAnswers ? submission.answers.map(a => ({
          questionIndex: a.questionIndex,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
          correctAnswer: quiz.questions[a.questionIndex].correctAnswer,
          explanation: quiz.questions[a.questionIndex].explanation
        })) : submission.answers.map(a => ({
          questionIndex: a.questionIndex,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect
        }))
      }
    }
  });
});

/**
 * @desc    Get quiz results
 * @route   GET /api/v1/student/quizzes/:id/results
 * @access  Private (Student)
 */
exports.getQuizResults = asyncHandler(async (req, res, next) => {
  // Get student profile first
  const studentProfile = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!studentProfile) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  const submission = await QuizSubmission.findOne({
    quizId: req.params.id,
    studentId: studentProfile._id,
    status: 'SUBMITTED',
    isDeleted: { $ne: true }
  })
  .populate({
    path: 'quizId',
    populate: {
      path: 'subjectId teacherId',
      select: 'name firstName lastName'
    }
  });

  if (!submission) {
    return next(new ErrorResponse('Quiz results not found', 404));
  }

  const quiz = await Quiz.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        maxMarks: quiz.maxMarks,
        passingMarks: quiz.passingMarks,
        totalQuestions: quiz.totalQuestions
      },
      submission: {
        attemptNumber: submission.attemptNumber,
        submittedAt: submission.submittedAt,
        timeTaken: submission.timeTakenFormatted,
        totalQuestions: submission.totalQuestions,
        correctAnswers: submission.correctAnswers,
        wrongAnswers: submission.wrongAnswers,
        totalMarks: submission.totalMarks,
        marksObtained: submission.marksObtained,
        percentage: submission.percentage,
        grade: submission.grade,
        passed: submission.passed,
        answers: quiz.showCorrectAnswers ? submission.answers.map(a => ({
          questionIndex: a.questionIndex,
          question: quiz.questions[a.questionIndex].question,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
          correctAnswer: quiz.questions[a.questionIndex].correctAnswer,
          explanation: quiz.questions[a.questionIndex].explanation,
          options: quiz.questions[a.questionIndex].options
        })) : null
      }
    }
  });
});

/**
 * @desc    Get student's quiz history
 * @route   GET /api/v1/student/quizzes/history
 * @access  Private (Student)
 */
exports.getQuizHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  // Get student profile first
  const studentProfile = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!studentProfile) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  const submissions = await QuizSubmission.find({
    studentId: studentProfile._id,
    isDeleted: { $ne: true }
  })
    .populate({
      path: 'quizId',
      populate: {
        path: 'subjectId teacherId',
        select: 'name firstName lastName'
      }
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ submittedAt: -1 });

  const total = await QuizSubmission.countDocuments({
    studentId: studentProfile._id,
    isDeleted: { $ne: true }
  });

  res.status(200).json({
    success: true,
    data: submissions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSubmissions: total
    }
  });
});

/**
 * @desc    Get student's quiz statistics
 * @route   GET /api/v1/student/quizzes/stats
 * @access  Private (Student)
 */
exports.getQuizStats = asyncHandler(async (req, res, next) => {
  // Get student profile first
  const studentProfile = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!studentProfile) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  const stats = await QuizSubmission.aggregate([
    {
      $match: {
        studentId: studentProfile._id,
        status: 'SUBMITTED',
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        totalMarks: { $sum: '$marksObtained' },
        averagePercentage: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        passedCount: {
          $sum: { $cond: ['$passed', 1, 0] }
        },
        totalCorrectAnswers: { $sum: '$correctAnswers' },
        totalQuestionsAttempted: { $sum: '$totalQuestions' }
      }
    }
  ]);

  const quizStats = stats[0] || {
    totalQuizzes: 0,
    totalMarks: 0,
    averagePercentage: 0,
    bestScore: 0,
    passedCount: 0,
    totalCorrectAnswers: 0,
    totalQuestionsAttempted: 0
  };

  // Calculate accuracy
  quizStats.accuracy = quizStats.totalQuestionsAttempted > 0 
    ? (quizStats.totalCorrectAnswers / quizStats.totalQuestionsAttempted) * 100 
    : 0;

  res.status(200).json({
    success: true,
    data: quizStats
  });
});
