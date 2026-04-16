const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getTeacherQuizzes,
  getQuizDetails,
  updateQuiz,
  publishQuiz,
  deleteQuiz,
  getQuizResults,
  getQuizLeaderboard,
  getSchoolLeaderboard
} = require('../controllers/quizController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateCreateQuiz, validateUpdateQuiz } = require('../validators/quizValidator');

/**
 * @swagger
 * tags:
 *   name: Quiz Management
 *   description: Teacher quiz creation and management system
 */

/**
 * @swagger
 * /teacher/quizzes:
 *   post:
 *     summary: Create new quiz
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subjectId
 *               - classId
 *               - sectionId
 *               - timeLimit
 *               - questions
 *               - startsAt
 *               - endsAt
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Quiz title
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Quiz description
 *               subjectId:
 *                 type: string
 *                 description: Subject ID
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               quizType:
 *                 type: string
 *                 enum: [MCQ, TRUE_FALSE, SHORT_ANSWER, MIXED]
 *                 default: MCQ
 *                 description: Type of quiz
 *               timeLimit:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 180
 *                 description: Time limit in minutes
 *               maxMarks:
 *                 type: number
 *                 minimum: 1
 *                 description: Maximum marks
 *               passingMarks:
 *                 type: number
 *                 minimum: 0
 *                 description: Passing marks
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                     - options
 *                     - correctAnswer
 *                     - marks
 *                   properties:
 *                     question:
 *                       type: string
 *                       maxLength: 500
 *                       description: Question text
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                         maxLength: 200
 *                       description: Answer options
 *                     correctAnswer:
 *                       type: number
 *                       minimum: 0
 *                       description: Index of correct option
 *                     marks:
 *                       type: number
 *                       minimum: 1
 *                       description: Question marks
 *                     explanation:
 *                       type: string
 *                       maxLength: 500
 *                       description: Explanation for correct answer
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 description: Quiz start time
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *                 description: Quiz end time
 *               allowRetake:
 *                 type: boolean
 *                 default: false
 *                 description: Allow quiz retake
 *               maxAttempts:
 *                 type: number
 *                 default: 1
 *                 minimum: 1
 *                 description: Maximum attempts allowed
 *               showCorrectAnswers:
 *                 type: boolean
 *                 default: true
 *                 description: Show correct answers after submission
 *               showResultsImmediately:
 *                 type: boolean
 *                 default: true
 *                 description: Show results immediately after submission
 *               randomizeQuestions:
 *                 type: boolean
 *                 default: false
 *                 description: Randomize question order
 *               randomizeOptions:
 *                 type: boolean
 *                 default: false
 *                 description: Randomize option order
 *               isSchoolWide:
 *                 type: boolean
 *                 default: false
 *                 description: Make quiz school-wide
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       400:
 *         description: Bad request or validation error
 *       403:
 *         description: Forbidden - no permission for class/section
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, validateCreateQuiz, createQuiz);

/**
 * @swagger
 * /teacher/quizzes:
 *   get:
 *     summary: Get teacher's quizzes
 *     tags: [Quiz Management]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ACTIVE, ENDED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Filter by section ID
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, getTeacherQuizzes);

/**
 * @swagger
 * /teacher/quizzes/{id}:
 *   get:
 *     summary: Get quiz details with statistics
 *     tags: [Quiz Management]
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
 *         description: Quiz details retrieved successfully
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, getQuizDetails);

/**
 * @swagger
 * /teacher/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quiz Management]
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
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               timeLimit:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 180
 *               passingMarks:
 *                 type: number
 *                 minimum: 0
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: number
 *                     marks:
 *                       type: number
 *                     explanation:
 *                       type: string
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *               allowRetake:
 *                 type: boolean
 *               maxAttempts:
 *                 type: number
 *               showCorrectAnswers:
 *                 type: boolean
 *               showResultsImmediately:
 *                 type: boolean
 *               randomizeQuestions:
 *                 type: boolean
 *               randomizeOptions:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       400:
 *         description: Bad request or quiz already published
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, validateUpdateQuiz, updateQuiz);

/**
 * @swagger
 * /teacher/quizzes/{id}/publish:
 *   post:
 *     summary: Publish quiz
 *     tags: [Quiz Management]
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
 *         description: Quiz published successfully
 *       400:
 *         description: Quiz already published or not in draft status
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/publish', authMiddleware, publishQuiz);

/**
 * @swagger
 * /teacher/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quiz Management]
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
 *         description: Quiz deleted successfully
 *       400:
 *         description: Cannot delete quiz with submissions
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, deleteQuiz);

/**
 * @swagger
 * /teacher/quizzes/{id}/results:
 *   get:
 *     summary: Get quiz results
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
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
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Quiz results retrieved successfully
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id/results', authMiddleware, getQuizResults);

/**
 * @swagger
 * /teacher/quizzes/{id}/leaderboard:
 *   get:
 *     summary: Get quiz leaderboard
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top performers
 *     responses:
 *       200:
 *         description: Quiz leaderboard retrieved successfully
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id/leaderboard', authMiddleware, getQuizLeaderboard);

/**
 * @swagger
 * /teacher/leaderboard:
 *   get:
 *     summary: Get school-wide quiz leaderboard
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of top performers
 *     responses:
 *       200:
 *         description: School leaderboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/leaderboard', authMiddleware, getSchoolLeaderboard);

module.exports = router;
