const express = require('express');
const {
  createExam,
  createSubject,
  addResult,
  getStudentResults,
} = require('../controllers/examsResultsController');
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exams and Results
 *   description: Exams and Results management APIs
 */

/**
 * @swagger
 * /results/exams:
 *   post:
 *     summary: Create an exam
 *     tags: [Exams and Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               classId:
 *                 type: string
 *               academicYear:
 *                 type: string
 *               examDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Exam created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /results/subjects:
 *   post:
 *     summary: Create a subject for a class
 *     tags: [Exams and Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               classId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /results/results:
 *   post:
 *     summary: Add marks for a student
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin: Allowed without restriction
 *       - teacher: Must have active TeacherAssignment for student's class/section and the subject
 *       - Others: Not allowed
 *     tags: [Exams and Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - examId
 *               - subjectId
 *               - marksObtained
 *               - maxMarks
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student's ObjectId
 *               examId:
 *                 type: string
 *                 description: Exam ObjectId
 *               subjectId:
 *                 type: string
 *                 description: Subject ObjectId (used for teacher assignment verification)
 *               marksObtained:
 *                 type: number
 *               maxMarks:
 *                 type: number
 *               grade:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Result added successfully
 *       400:
 *         description: Duplicate result or bad request
 *       403:
 *         description: Not authorized (teacher not assigned to this subject)
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * /results/results/student/{studentId}:
 *   get:
 *     summary: Get student results for a specific exam
 *     tags: [Exams and Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student results retrieved successfully
 *       404:
 *         description: Results not found
 */

// Apply authentication and authorization middleware
router.use(protect);
router.use(authorizeRoles('superadmin', 'school_admin', 'teacher'));

// Routes
router.post('/exams', createExam);
router.post('/subjects', createSubject);
router.post('/results', addResult);
router.get('/results/student/:studentId', getStudentResults);

module.exports = router;