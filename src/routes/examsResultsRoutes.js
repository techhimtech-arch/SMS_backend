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
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin/teacher: Can access any student's results
 *       - parent: Can only access their own children's results (403 if studentId doesn't belong to them)
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
 *       403:
 *         description: Parent not authorized to access this student's data
 *       404:
 *         description: Results not found
 */

// Apply authentication middleware
router.use(protect);

// Routes with specific role authorization
// POST routes - only admin/teacher
router.post('/exams', authorizeRoles('superadmin', 'school_admin', 'teacher'), createExam);
router.post('/subjects', authorizeRoles('superadmin', 'school_admin', 'teacher'), createSubject);
router.post('/results', authorizeRoles('superadmin', 'school_admin', 'teacher'), addResult);

// GET routes - allow parent for their own children
router.get('/results/student/:studentId', authorizeRoles('superadmin', 'school_admin', 'teacher', 'parent'), getStudentResults);

module.exports = router;