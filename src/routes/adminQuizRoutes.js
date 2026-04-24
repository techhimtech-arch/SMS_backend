const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');
const auditLogger = require('../utils/auditLogger');

/**
 * @swagger
 * tags:
 *   name: Admin Quiz Management
 *   description: Admin quiz management endpoints
 */

/**
 * @swagger
 * /admin/quizzes:
 *   get:
 *     summary: Get all school quizzes
 *     tags: [Admin Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ACTIVE, ENDED, CANCELLED]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 */
router.get(
  '/',
  authMiddleware,
  roleGuard(['admin', 'school_admin']),
  asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, status, classId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      schoolId: req.user.schoolId
    };

    if (status) filter.status = status;
    if (classId) filter.classId = classId;

    const quizzes = await Quiz.find(filter)
      .populate('teacherId', 'firstName lastName email')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments(filter);

    // Attach submission stats to each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const submissions = await QuizSubmission.find({ quizId: quiz._id });
        const averageScore = submissions.length > 0
          ? (submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length).toFixed(2)
          : 0;

        return {
          ...quiz.toObject(),
          totalSubmissions: submissions.length,
          averageScore: parseFloat(averageScore)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: quizzesWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQuizzes: total,
        limit: parseInt(limit)
      }
    });

    await auditLogger.log({
      action: 'DATA_EXPORT',
      userId: req.user.userId,
      userRole: req.user.role,
      schoolId: req.user.schoolId,
      resourceType: 'Quiz',
      description: 'Admin viewed all school quizzes',
      path: req.path,
      method: req.method,
      statusCode: 200
    });
  })
);

/**
 * @swagger
 * /admin/quizzes/analytics:
 *   get:
 *     summary: Get school quiz analytics
 *     tags: [Admin Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get(
  '/analytics',
  authMiddleware,
  roleGuard(['admin', 'school_admin']),
  asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    const filter = { schoolId: req.user.schoolId };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const quizzes = await Quiz.find(filter)
      .populate('subjectId', 'name')
      .populate('classId', 'name');

    const submissions = await QuizSubmission.find({
      schoolId: req.user.schoolId
    });

    // Calculate analytics
    const analytics = {
      totalQuizzes: quizzes.length,
      activeQuizzes: quizzes.filter(q => q.status === 'ACTIVE').length,
      totalSubmissions: submissions.length,
      averageParticipation: submissions.length > 0
        ? ((submissions.length / (quizzes.length * 45)) * 100).toFixed(2) // Assuming 45 students per class
        : 0,
      topSubjects: [],
      topPerformers: [],
      averageScore: submissions.length > 0
        ? (submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length).toFixed(2)
        : 0
    };

    // Top subjects by quiz count
    const subjectStats = {};
    quizzes.forEach(quiz => {
      const subject = quiz.subjectId?.name || 'Unknown';
      subjectStats[subject] = (subjectStats[subject] || 0) + 1;
    });

    analytics.topSubjects = Object.entries(subjectStats)
      .map(([name, count]) => ({ subjectName: name, quizCount: count }))
      .sort((a, b) => b.quizCount - a.quizCount)
      .slice(0, 5);

    // Top performers
    const studentScores = {};
    submissions.forEach(sub => {
      if (!studentScores[sub.studentId]) {
        studentScores[sub.studentId] = { scores: [], count: 0 };
      }
      studentScores[sub.studentId].scores.push(sub.score || 0);
      studentScores[sub.studentId].count += 1;
    });

    analytics.topPerformers = Object.entries(studentScores)
      .map(([studentId, data]) => ({
        studentId,
        averageScore: (data.scores.reduce((a, b) => a + b, 0) / data.count).toFixed(2),
        totalQuizzes: data.count
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: analytics
    });

    await auditLogger.log({
      action: 'DATA_EXPORT',
      userId: req.user.userId,
      userRole: req.user.role,
      schoolId: req.user.schoolId,
      resourceType: 'Quiz',
      description: 'Admin viewed quiz analytics',
      path: req.path,
      method: req.method,
      statusCode: 200
    });
  })
);

/**
 * @swagger
 * /admin/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Admin Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  '/:id',
  authMiddleware,
  roleGuard(['admin', 'school_admin']),
  asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    if (quiz.schoolId.toString() !== req.user.schoolId.toString()) {
      return next(new ErrorResponse('Not authorized to delete this quiz', 403));
    }

    // Delete quiz submissions
    await QuizSubmission.deleteMany({ quizId: req.params.id });

    // Delete quiz
    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully by admin'
    });

    await auditLogger.log({
      action: 'QUIZ_DELETE',
      userId: req.user.userId,
      userRole: req.user.role,
      schoolId: req.user.schoolId,
      resourceType: 'Quiz',
      resourceId: req.params.id,
      description: `Admin deleted quiz: ${quiz.title}`,
      path: req.path,
      method: req.method,
      statusCode: 200
    });
  })
);

/**
 * @swagger
 * /admin/quizzes/{id}:
 *   get:
 *     summary: Get quiz details with submissions
 *     tags: [Admin Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/:id',
  authMiddleware,
  roleGuard(['admin', 'school_admin']),
  asyncHandler(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id)
      .populate('teacherId', 'firstName lastName email')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name');

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    if (quiz.schoolId.toString() !== req.user.schoolId.toString()) {
      return next(new ErrorResponse('Not authorized to view this quiz', 403));
    }

    const submissions = await QuizSubmission.find({ quizId: req.params.id })
      .populate('studentId', 'firstName lastName enrollmentNumber');

    const stats = {
      totalSubmissions: submissions.length,
      averageScore: submissions.length > 0
        ? (submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length).toFixed(2)
        : 0,
      highestScore: submissions.length > 0 ? Math.max(...submissions.map(s => s.score || 0)) : 0,
      lowestScore: submissions.length > 0 ? Math.min(...submissions.map(s => s.score || 0)) : 0,
      passedCount: submissions.filter(s => s.score >= quiz.passingMarks).length
    };

    res.status(200).json({
      success: true,
      data: {
        quiz: quiz.toObject(),
        submissions,
        stats
      }
    });
  })
);

module.exports = router;
