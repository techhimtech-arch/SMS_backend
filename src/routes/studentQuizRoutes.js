const express = require('express');
const router = express.Router();
const {
  getAvailableQuizzes,
  startQuiz,
  submitAnswer,
  submitQuiz,
  getQuizResults,
  getQuizHistory,
  getQuizStats
} = require('../controllers/studentQuizController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateQuizAnswer, validateQuizSubmission } = require('../validators/quizValidator');

/**
 * @swagger
 * tags:
 *   name: Student Quiz
 *   description: Student quiz taking and results system
 */

/**
 * @swagger
 * /student/quizzes:
 *   get:
 *     summary: Get available quizzes for student
 *     tags: [Student Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Available quizzes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student enrollment not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, getAvailableQuizzes);

/**
 * @swagger
 * /student/quizzes/{id}/start:
 *   post:
 *     summary: Start quiz attempt
 *     tags: [Student Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissionId:
 *                   type: string
 *                   description: Submission ID
 *                 quiz:
 *                   type: object
 *                   description: Quiz details
 *                 questions:
 *                   type: array
 *                   description: Quiz questions
 *                 timeRemaining:
 *                   type: number
 *                   description: Time remaining in seconds
 *                 startedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Quiz start time
 *       400:
 *         description: Quiz not active, maximum attempts reached, or quiz already in progress
 *       403:
 *         description: Student not enrolled in class
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/start', authMiddleware, startQuiz);

/**
 * @swagger
 * /student/quizzes/{id}/answer:
 *   post:
 *     summary: Submit quiz answer
 *     tags: [Student Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionIndex
 *               - selectedAnswer
 *             properties:
 *               questionIndex:
 *                 type: integer
 *                 description: Index of question
 *               selectedAnswer:
 *                 type: integer
 *                 description: Selected option index
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeRemaining:
 *                   type: number
 *                   description: Time remaining in seconds
 *       400:
 *         description: No active quiz attempt found or time limit exceeded
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/answer', authMiddleware, validateQuizAnswer, submitAnswer);

/**
 * @swagger
 * /student/quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz
 *     tags: [Student Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissionId:
 *                   type: string
 *                   description: Submission ID
 *                 results:
 *                   type: object
 *                   properties:
 *                     totalQuestions:
 *                       type: integer
 *                       description: Total questions
 *                     correctAnswers:
 *                       type: integer
 *                       description: Correct answers
 *                     wrongAnswers:
 *                       type: integer
 *                       description: Wrong answers
 *                     totalMarks:
 *                       type: number
 *                       description: Total marks
 *                     marksObtained:
 *                       type: number
 *                       description: Marks obtained
 *                     percentage:
 *                       type: number
 *                       description: Percentage score
 *                     grade:
 *                       type: string
 *                       description: Grade
 *                     passed:
 *                       type: boolean
 *                       description: Pass/Fail status
 *                     timeTaken:
 *                       type: string
 *                       description: Time taken
 *                     answers:
 *                       type: array
 *                       description: Answer details with explanations
 *       404:
 *         description: No active quiz attempt found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/submit', authMiddleware, validateQuizSubmission, submitQuiz);

/**
 * @swagger
 * /student/quizzes/{id}/results:
 *   get:
 *     summary: Get quiz results
 *     tags: [Student Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   type: object
 *                   description: Quiz details
 *                 submission:
 *                   type: object
 *                   description: Submission details with answers
 *       404:
 *         description: Quiz results not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id/results', authMiddleware, getQuizResults);

/**
 * @swagger
 * /student/quizzes/history:
 *   get:
 *     summary: Get student's quiz history
 *     tags: [Student Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Quiz history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/history', authMiddleware, getQuizHistory);

/**
 * @swagger
 * /student/quizzes/stats:
 *   get:
 *     summary: Get student's quiz statistics
 *     tags: [Student Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quiz statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalQuizzes:
 *                   type: integer
 *                   description: Total quizzes attempted
 *                 totalMarks:
 *                   type: number
 *                   description: Total marks obtained
 *                 averagePercentage:
 *                   type: number
 *                   description: Average percentage
 *                 bestScore:
 *                   type: number
 *                   description: Best score percentage
 *                 passedCount:
 *                   type: integer
 *                   description: Number of passed quizzes
 *                 accuracy:
 *                   type: number
 *                   description: Overall accuracy percentage
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authMiddleware, getQuizStats);

module.exports = router;
