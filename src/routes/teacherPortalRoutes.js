const express = require('express');
const {
  getProfile,
  getAssignedClasses,
  getAssignedStudents,
  getAttendance,
  markAttendance,
  updateAttendance,
  getExams,
  getResults,
  addResult,
  updateResult,
  getDashboardStats,
} = require('../controllers/teacherPortalController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teacher Portal
 *   description: Teacher portal routes for managing classes, students, attendance, and results
 */

// =============================================
// Teacher Portal Routes (teacher only)
// =============================================

/**
 * @swagger
 * /teacher/profile:
 *   get:
 *     summary: Get teacher profile with assignments
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher profile with subject and class assignments
 *       404:
 *         description: Teacher not found
 */
router.get('/profile', authMiddleware, authorizeRoles('teacher'), getProfile);

/**
 * @swagger
 * /teacher/classes:
 *   get:
 *     summary: Get classes assigned to teacher
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of assigned classes and subjects
 */
router.get('/classes', authMiddleware, authorizeRoles('teacher'), getAssignedClasses);

/**
 * @swagger
 * /teacher/students:
 *   get:
 *     summary: Get students from assigned classes
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of students from assigned classes
 *       403:
 *         description: No access to requested class/section
 */
router.get('/students', authMiddleware, authorizeRoles('teacher'), getAssignedStudents);

/**
 * @swagger
 * /teacher/attendance:
 *   get:
 *     summary: Get attendance for assigned students
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Attendance records for assigned students
 *       403:
 *         description: No access to requested class/section
 */
router.get('/attendance', authMiddleware, authorizeRoles('teacher'), getAttendance);

/**
 * @swagger
 * /teacher/attendance/mark:
 *   post:
 *     summary: Mark attendance for students
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - sectionId
 *               - date
 *               - attendanceRecords
 *             properties:
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               attendanceRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - status
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Present, Absent, Late, Half Day, Leave]
 *                     remarks:
 *                       type: string
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Attendance already exists or invalid data
 *       403:
 *         description: No access to requested class/section
 */
router.post('/attendance/mark', authMiddleware, authorizeRoles('teacher'), markAttendance);

/**
 * @swagger
 * /teacher/attendance/update:
 *   put:
 *     summary: Update attendance record
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendanceId
 *               - status
 *             properties:
 *               attendanceId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Late, Half Day, Leave]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *       403:
 *         description: No access to modify this attendance
 *       404:
 *         description: Attendance record not found
 */
router.put('/attendance/update', authMiddleware, authorizeRoles('teacher'), updateAttendance);

/**
 * @swagger
 * /teacher/exams:
 *   get:
 *     summary: Get exams for assigned classes
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of exams for assigned classes
 */
router.get('/exams', authMiddleware, authorizeRoles('teacher'), getExams);

/**
 * @swagger
 * /teacher/results:
 *   get:
 *     summary: Get results for assigned students
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *         description: Filter by exam ID
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *         description: Filter by subject ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Results for assigned students
 *       403:
 *         description: No access to requested class/section/subject
 */
router.get('/results', authMiddleware, authorizeRoles('teacher'), getResults);

/**
 * @swagger
 * /teacher/results/add:
 *   post:
 *     summary: Add exam results for students
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - subjectId
 *               - classId
 *               - sectionId
 *               - results
 *             properties:
 *               examId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - marksObtained
 *                     - maxMarks
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     marksObtained:
 *                       type: number
 *                     maxMarks:
 *                       type: number
 *                     grade:
 *                       type: string
 *                     remarks:
 *                       type: string
 *     responses:
 *       201:
 *         description: Results added successfully
 *       400:
 *         description: Results already exist or invalid data
 *       403:
 *         description: No access to this class/section/subject
 */
router.post('/results/add', authMiddleware, authorizeRoles('teacher'), addResult);

/**
 * @swagger
 * /teacher/results/update:
 *   put:
 *     summary: Update exam result
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resultId
 *             properties:
 *               resultId:
 *                 type: string
 *               marksObtained:
 *                 type: number
 *               maxMarks:
 *                 type: number
 *               grade:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Result updated successfully
 *       403:
 *         description: No access to modify this result
 *       404:
 *         description: Result record not found
 */
router.put('/results/update', authMiddleware, authorizeRoles('teacher'), updateResult);

/**
 * @swagger
 * /teacher/dashboard:
 *   get:
 *     summary: Get teacher dashboard statistics
 *     tags: [Teacher Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher dashboard statistics including student count, attendance, exams, etc.
 */
router.get('/dashboard', authMiddleware, authorizeRoles('teacher'), getDashboardStats);

module.exports = router;
