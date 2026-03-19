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
  getLinkedStudents
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

module.exports = router;