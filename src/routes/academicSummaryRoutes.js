const express = require('express');
const router = express.Router();
const {
  getAcademicSummary,
  getClassStats,
  getEnrollmentTrends
} = require('../controllers/academicSummaryController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Academic Summary
 *   description: Academic dashboard and reporting endpoints
 */

/**
 * @swagger
 * /academic/summary:
 *   get:
 *     summary: Get comprehensive academic summary for dashboard
 *     tags: [Academic Summary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *     responses:
 *       200:
 *         description: Academic summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalClasses:
 *                       type: integer
 *                       description: Total number of classes
 *                     totalSections:
 *                       type: integer
 *                       description: Total number of sections
 *                     totalSubjects:
 *                       type: integer
 *                       description: Total number of subjects
 *                     totalEnrollments:
 *                       type: integer
 *                       description: Total number of enrollments
 *                     totalTeachers:
 *                       type: integer
 *                       description: Total number of teachers
 *                     enrollmentStatusBreakdown:
 *                       type: object
 *                       description: Breakdown of enrollment statuses
 *                 classWiseStats:
 *                   type: array
 *                   description: Class-wise statistics
 *                 subjectDistribution:
 *                   type: object
 *                   description: Subject distribution by department
 *                 topTeachers:
 *                   type: array
 *                   description: Top teachers by student count
 *                 sessionInfo:
 *                   type: object
 *                   description: Session information
 *       400:
 *         description: Academic session ID required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, getAcademicSummary);

/**
 * @swagger
 * /academic/class-stats/{classId}:
 *   get:
 *     summary: Get detailed statistics for a specific class
 *     tags: [Academic Summary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *     responses:
 *       200:
 *         description: Class statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Class name
 *                 totalSections:
 *                   type: integer
 *                   description: Total sections in class
 *                 totalSubjects:
 *                   type: integer
 *                   description: Total subjects for class
 *                 totalEnrollments:
 *                   type: integer
 *                   description: Total enrollments in class
 *                 maleStudents:
 *                   type: integer
 *                   description: Number of male students
 *                 femaleStudents:
 *                   type: integer
 *                   description: Number of female students
 *       400:
 *         description: Academic session ID required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.get('/class-stats/:classId', authMiddleware, getClassStats);

/**
 * @swagger
 * /academic/enrollment-trends:
 *   get:
 *     summary: Get enrollment trends over multiple years
 *     tags: [Academic Summary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Current academic session ID
 *       - in: query
 *         name: years
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 3
 *         description: Number of years to analyze
 *     responses:
 *       200:
 *         description: Enrollment trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: integer
 *                     description: Academic year
 *                   totalEnrollments:
 *                     type: integer
 *                     description: Total enrollments that year
 *                   newEnrollments:
 *                     type: integer
 *                     description: New enrollments for that year
 *                   promotedStudents:
 *                     type: integer
 *                     description: Promoted students that year
 *                   droppedStudents:
 *                     type: integer
 *                     description: Students dropped out that year
 *       400:
 *         description: Academic session ID required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/enrollment-trends', authMiddleware, getEnrollmentTrends);

module.exports = router;
