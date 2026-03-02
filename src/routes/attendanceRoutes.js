const express = require('express');
const {
  markAttendance,
  bulkMarkAttendance,
  getAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management APIs
 */

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Mark attendance for a single student
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin: Allowed without restriction
 *       - teacher: Must have active TeacherAssignment for the class/section/subject
 *       - Others: Not allowed
 *     tags: [Attendance]
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
 *               - classId
 *               - sectionId
 *               - subjectId
 *               - date
 *               - status
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student's ObjectId
 *               classId:
 *                 type: string
 *                 description: Class ObjectId
 *               sectionId:
 *                 type: string
 *                 description: Section ObjectId
 *               subjectId:
 *                 type: string
 *                 description: Subject ObjectId (required for teacher assignment verification)
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Leave]
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Duplicate attendance or bad request
 *       403:
 *         description: Not authorized (teacher not assigned to this subject)
 */

/**
 * @swagger
 * /attendance/bulk:
 *   post:
 *     summary: Mark attendance for multiple students in bulk
 *     description: |
 *       Role-based access:
 *       - superadmin/school_admin: Allowed without restriction
 *       - teacher: Must have active TeacherAssignment for the class/section/subject
 *       - Others: Not allowed
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - classId
 *               - sectionId
 *               - subjectId
 *               - records
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               classId:
 *                 type: string
 *                 description: Class ObjectId
 *               sectionId:
 *                 type: string
 *                 description: Section ObjectId
 *               subjectId:
 *                 type: string
 *                 description: Subject ObjectId (required for teacher assignment verification)
 *               records:
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
 *                       enum: [Present, Absent, Leave]
 *     responses:
 *       201:
 *         description: Bulk attendance marked successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Not authorized (teacher not assigned to this subject)
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 *       404:
 *         description: Attendance record not found
 */

// Apply authentication and authorization middleware
router.use(protect);
router.use(authorizeRoles('superadmin', 'school_admin', 'teacher'));

// Routes
router.post('/', markAttendance);
router.post('/bulk', bulkMarkAttendance);
router.get('/', getAttendance);
router.delete('/:id', deleteAttendance);

module.exports = router;