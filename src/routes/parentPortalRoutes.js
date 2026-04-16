const express = require('express');
const {
  getProfile,
  getAttendance,
  getFees,
  getResults,
} = require('../controllers/parentController');
const {
  getParentDashboard,
  getStudentDetail,
  getLinkedStudents,
  getChildAttendance,
  getChildFees,
  getChildResults,
  getChildAnnouncements,
  getChildTimetable,
  getChildHomework,
  getChildRemarks,
  getChildPerformance
} = require('../controllers/parentPortalController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parent Portal
 *   description: Parent portal routes - student fetched internally via parentUserId
 */

// =============================================
// Parent Portal Routes (parent only)
// Security: No studentId from frontend
// =============================================

/**
 * @swagger
 * /parent/dashboard:
 *   get:
 *     summary: Get parent dashboard data (Phase 5)
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parent dashboard with linked students, attendance, fees, results, announcements
 *       403:
 *         description: Access denied - Parent role required
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authMiddleware, authorizeRoles('parent'), getParentDashboard);

/**
 * @swagger
 * /parent/students:
 *   get:
 *     summary: Get all students linked to parent (Phase 5)
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Linked students retrieved successfully
 *       403:
 *         description: Access denied - Parent role required
 *       401:
 *         description: Unauthorized
 */
router.get('/students', authMiddleware, authorizeRoles('parent'), getLinkedStudents);

/**
 * @swagger
 * /parent/student/{studentId}:
 *   get:
 *     summary: Get detailed information for a specific student (Phase 5)
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details including profile, attendance, results, assignments, fees
 *       403:
 *         description: Access denied - Not linked to this student
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 */
router.get('/student/:studentId', authMiddleware, authorizeRoles('parent'), getStudentDetail);

/**
 * @swagger
 * /parent/profile:
 *   get:
 *     summary: Get parent profile with linked student info
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parent and student basic info
 *       404:
 *         description: Parent not found
 */
router.get('/profile', authMiddleware, authorizeRoles('parent'), getProfile);

/**
 * @swagger
 * /parent/attendance:
 *   get:
 *     summary: Get linked student's attendance records
 *     tags: [Parent Portal]
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
 *     responses:
 *       200:
 *         description: Student's attendance records
 *       404:
 *         description: No linked student found
 */
router.get('/attendance', authMiddleware, authorizeRoles('parent'), getAttendance);

/**
 * @swagger
 * /parent/fees:
 *   get:
 *     summary: Get linked student's fee details and payment history
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee details (totalAmount, paidAmount, balanceAmount, paymentHistory)
 *       404:
 *         description: No linked student found
 */
router.get('/fees', authMiddleware, authorizeRoles('parent'), getFees);

/**
 * @swagger
 * /parent/results:
 *   get:
 *     summary: Get linked student's exam results
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *         description: Optional - Filter by specific exam
 *     responses:
 *       200:
 *         description: Subject-wise marks, total, and grade
 *       404:
 *         description: No linked student found
 */
router.get('/results', authMiddleware, authorizeRoles('parent'), getResults);

// =============================================
// Child-Specific Data Access Routes
// With ParentStudentMapping access verification
// =============================================

/**
 * @swagger
 * /parent/children/{studentId}/attendance:
 *   get:
 *     summary: Get specific child's attendance records
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Child's attendance with summary
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/attendance', authMiddleware, authorizeRoles('parent'), getChildAttendance);

/**
 * @swagger
 * /parent/children/{studentId}/fees:
 *   get:
 *     summary: Get specific child's fee details
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Child's fee information
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/fees', authMiddleware, authorizeRoles('parent'), getChildFees);

/**
 * @swagger
 * /parent/children/{studentId}/results:
 *   get:
 *     summary: Get specific child's exam results
 *     tags: [Parent Portal]
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
 *         description: Child's exam results
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/results', authMiddleware, authorizeRoles('parent'), getChildResults);

/**
 * @swagger
 * /parent/children/{studentId}/announcements:
 *   get:
 *     summary: Get announcements for child's class
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class and school announcements
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/announcements', authMiddleware, authorizeRoles('parent'), getChildAnnouncements);

/**
 * @swagger
 * /parent/children/{studentId}/timetable:
 *   get:
 *     summary: Get child's class timetable
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class timetable
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/timetable', authMiddleware, authorizeRoles('parent'), getChildTimetable);

/**
 * @swagger
 * /parent/children/{studentId}/homework:
 *   get:
 *     summary: Get child's homework assignments
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Child's homework assignments with submission status
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/homework', authMiddleware, authorizeRoles('parent'), getChildHomework);

/**
 * @swagger
 * /parent/children/{studentId}/remarks:
 *   get:
 *     summary: Get child's remarks
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Child's remarks
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/remarks', authMiddleware, authorizeRoles('parent'), getChildRemarks);

/**
 * @swagger
 * /parent/children/{studentId}/performance:
 *   get:
 *     summary: Get child's performance summary
 *     tags: [Parent Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Child's comprehensive performance summary
 *       403:
 *         description: Access denied - Not parent of this student
 *       404:
 *         description: Student not found
 */
router.get('/children/:studentId/performance', authMiddleware, authorizeRoles('parent'), getChildPerformance);

module.exports = router;