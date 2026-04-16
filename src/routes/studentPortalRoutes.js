const express = require('express');
const {
  getProfile,
  updateProfile,
  getAttendance,
  getFees,
  getResults,
  getExams,
  getAnnouncements,
  getDashboardStats,
  getHomework,
  getHomeworkDetails,
  submitHomework,
  getRemarks,
} = require('../controllers/studentPortalController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Student Portal
 *   description: Student portal routes for accessing profile, attendance, fees, and results
 */

// =============================================
// Student Portal Routes (student only)
// =============================================

/**
 * @swagger
 * /student/profile:
 *   get:
 *     summary: Get student profile
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile with user and academic information
 *       404:
 *         description: Student profile not found
 */
router.get('/profile', authMiddleware, authorizeRoles('student'), getProfile);

/**
 * @swagger
 * /student/profile:
 *   put:
 *     summary: Update student profile
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               address:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Student profile not found
 */
router.put('/profile', authMiddleware, authorizeRoles('student'), updateProfile);

/**
 * @swagger
 * /student/attendance:
 *   get:
 *     summary: Get student's attendance records
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Attendance records with statistics
 */
router.get('/attendance', authMiddleware, authorizeRoles('student'), getAttendance);

/**
 * @swagger
 * /student/fees:
 *   get:
 *     summary: Get student's fee details
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee structure and payment history
 */
router.get('/fees', authMiddleware, authorizeRoles('student'), getFees);

/**
 * @swagger
 * /student/results:
 *   get:
 *     summary: Get student's exam results
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Exam results with statistics
 */
router.get('/results', authMiddleware, authorizeRoles('student'), getResults);

/**
 * @swagger
 * /student/exams:
 *   get:
 *     summary: Get upcoming and recent exams
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, completed]
 *           default: upcoming
 *         description: Filter exam status
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
 *         description: List of exams
 */
router.get('/exams', authMiddleware, authorizeRoles('student'), getExams);

/**
 * @swagger
 * /student/announcements:
 *   get:
 *     summary: Get announcements for student
 *     tags: [Student Portal]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Announcements relevant to the student
 */
router.get('/announcements', authMiddleware, authorizeRoles('student'), getAnnouncements);

/**
 * @swagger
 * /student/dashboard:
 *   get:
 *     summary: Get student dashboard statistics
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard with attendance, fees, results, and announcements
 */
router.get('/dashboard', authMiddleware, authorizeRoles('student'), getDashboardStats);

// Homework Management Routes
/**
 * @swagger
 * /student/homework:
 *   get:
 *     summary: Get student homework assignments
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, overdue, all]
 *         description: Filter by homework status
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
 *         description: List of homework assignments with submission status
 */
router.get('/homework', authMiddleware, authorizeRoles('student'), getHomework);

/**
 * @swagger
 * /student/homework/{homeworkId}:
 *   get:
 *     summary: Get single homework with submission details
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeworkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Homework details with submission status
 *       404:
 *         description: Homework not found
 */
router.get('/homework/:homeworkId', authMiddleware, authorizeRoles('student'), getHomeworkDetails);

/**
 * @swagger
 * /student/homework/{homeworkId}/submit:
 *   post:
 *     summary: Submit homework assignment
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeworkId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Homework submitted successfully
 *       400:
 *         description: Homework already submitted or overdue
 *       404:
 *         description: Homework not found
 */
router.post('/homework/:homeworkId/submit', authMiddleware, authorizeRoles('student'), submitHomework);

// Remarks Routes
/**
 * @swagger
 * /student/remarks:
 *   get:
 *     summary: Get student remarks
 *     tags: [Student Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [ACADEMIC, BEHAVIOR, DISCIPLINE, ATTENDANCE, EXTRA_CURRICULAR, GENERAL]
 *         description: Filter by remark category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [POSITIVE, NEGATIVE, NEUTRAL]
 *         description: Filter by remark type
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
 *         description: List of student remarks
 */
router.get('/remarks', authMiddleware, authorizeRoles('student'), getRemarks);

module.exports = router;
