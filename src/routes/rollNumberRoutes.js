const express = require('express');
const router = express.Router();
const {
  bulkAssignRollNumbers,
  reassignRollNumbers,
  getRollNumberAssignments,
  autoAssignSessionRollNumbers,
  validateRollNumber
} = require('../controllers/rollNumberController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Roll Number Management
 *   description: Student roll number allocation and management
 */

/**
 * @swagger
 * /roll-numbers/bulk-assign:
 *   post:
 *     summary: Assign roll numbers to multiple students
 *     tags: [Roll Number Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enrollments
 *               - academicSessionId
 *             properties:
 *               enrollments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     enrollmentId:
 *                       type: string
 *                       description: Enrollment ID
 *                     studentId:
 *                       type: string
 *                       description: Student ID
 *               description: Array of enrollment objects with IDs
 *               startFrom:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Starting roll number
 *               prefix:
 *                 type: string
 *                 description: Prefix for roll numbers
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID
 *     responses:
 *       200:
 *         description: Roll numbers assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       enrollmentId:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       assignedRollNumber:
 *                         type: string
 *                       studentId:
 *                         type: string
 *                       error:
 *                         type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: integer
 *                     successful:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/bulk-assign', authMiddleware, bulkAssignRollNumbers);

/**
 * @swagger
 * /roll-numbers/reassign:
 *   post:
 *     summary: Reassign roll numbers for a class-section
 *     tags: [Roll Number Management]
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
 *               - academicSessionId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID
 *               startFrom:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Starting roll number
 *               prefix:
 *                 type: string
 *                 description: Prefix for roll numbers
 *               preserveExisting:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to preserve existing roll numbers
 *     responses:
 *       200:
 *         description: Roll numbers reassigned successfully
 *       400:
 *         description: Bad request or missing parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Section not found
 *       500:
 *         description: Internal server error
 */
router.post('/reassign', authMiddleware, reassignRollNumbers);

/**
 * @swagger
 * /roll-numbers/class/{classId}/section/{sectionId}:
 *   get:
 *     summary: Get roll number assignments for a class-section
 *     tags: [Roll Number Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by student name or roll number
 *     responses:
 *       200:
 *         description: Roll number assignments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Enrollment ID
 *                   rollNumber:
 *                     type: string
 *                     description: Assigned roll number
 *                   studentId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Student ID
 *                       admissionNumber:
 *                         type: string
 *                         description: Student admission number
 *                       firstName:
 *                         type: string
 *                         description: Student first name
 *                       lastName:
 *                         type: string
 *                         description: Student last name
 *       400:
 *         description: Academic session ID required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Section not found
 *       500:
 *         description: Internal server error
 */
router.get('/class/:classId/section/:sectionId', authMiddleware, getRollNumberAssignments);

/**
 * @swagger
 * /roll-numbers/auto-assign-session:
 *   post:
 *     summary: Auto-assign roll numbers for all classes in a session
 *     tags: [Roll Number Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academicSessionId
 *             properties:
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID
 *               prefix:
 *                 type: string
 *                 description: Prefix for roll numbers
 *     responses:
 *       200:
 *         description: Auto roll number assignment completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 academicSessionId:
 *                   type: string
 *                   description: Academic session ID
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalSections:
 *                       type: integer
 *                       description: Total sections processed
 *                     totalProcessed:
 *                       type: integer
 *                       description: Total enrollments processed
 *                     totalSuccessful:
 *                       type: integer
 *                       description: Successfully assigned roll numbers
 *                     totalFailed:
 *                       type: integer
 *                       description: Failed assignments
 *       400:
 *         description: Academic session ID required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/auto-assign-session', authMiddleware, autoAssignSessionRollNumbers);

/**
 * @swagger
 * /roll-numbers/validate:
 *   post:
 *     summary: Validate roll number uniqueness
 *     tags: [Roll Number Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rollNumber
 *               - classId
 *               - sectionId
 *               - academicSessionId
 *             properties:
 *               rollNumber:
 *                 type: string
 *                 description: Roll number to validate
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID
 *               excludeId:
 *                 type: string
 *                 description: Enrollment ID to exclude from check
 *     responses:
 *       200:
 *         description: Roll number validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rollNumber:
 *                   type: string
 *                   description: Roll number being validated
 *                 classId:
 *                   type: string
 *                   description: Class ID
 *                 sectionId:
 *                   type: string
 *                   description: Section ID
 *                 academicSessionId:
 *                   type: string
 *                   description: Academic session ID
 *                 isAvailable:
 *                   type: boolean
 *                   description: Whether roll number is available
 *                 existingEnrollmentId:
 *                   type: string
 *                   description: ID of existing enrollment with this roll number
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/validate', authMiddleware, validateRollNumber);

module.exports = router;
