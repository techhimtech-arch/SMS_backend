const express = require('express');
const router = express.Router();
const {
  createTimetableSlot,
  createBulkTimetable,
  getClassTimetable,
  getTeacherTimetable,
  getWeeklyTimetable,
  updateTimetableSlot,
  deleteTimetableSlot,
  deleteClassTimetable
} = require('../controllers/timetableController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Timetable
 *   description: Academic timetable management with conflict validation
 */

/**
 * @swagger
 * /timetable:
 *   post:
 *     summary: Create a new timetable slot
 *     tags: [Timetable]
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
 *               - day
 *               - periodNumber
 *               - subjectId
 *               - teacherId
 *               - startTime
 *               - endTime
 *               - academicSessionId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               day:
 *                 type: string
 *                 enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *                 description: Day of the week
 *               periodNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Period number (1-12)
 *               subjectId:
 *                 type: string
 *                 description: Subject ID
 *               teacherId:
 *                 type: string
 *                 description: Teacher ID
 *               startTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *                 description: Start time in HH:MM format (24-hour)
 *               endTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *                 description: End time in HH:MM format (24-hour)
 *               room:
 *                 type: string
 *                 maxLength: 50
 *                 description: Room number (optional)
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID
 *               semester:
 *                 type: string
 *                 enum: [FIRST, SECOND]
 *                 default: FIRST
 *                 description: Semester
 *     responses:
 *       201:
 *         description: Timetable slot created successfully
 *       400:
 *         description: Bad request or conflict detected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, createTimetableSlot);

/**
 * @swagger
 * /timetable/bulk:
 *   post:
 *     summary: Create multiple timetable slots
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timetableSlots
 *               - academicSessionId
 *             properties:
 *               timetableSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Array of timetable slot objects
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID for all slots
 *     responses:
 *       201:
 *         description: Timetable slots created successfully
 *       400:
 *         description: Bad request or conflict detected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/bulk', authMiddleware, createBulkTimetable);

/**
 * @swagger
 * /timetable/class/{classId}/section/{sectionId}:
 *   get:
 *     summary: Get class timetable
 *     tags: [Timetable]
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
 *         name: day
 *         schema:
 *           type: string
 *           enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *         description: Filter by specific day
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [FIRST, SECOND]
 *         description: Filter by semester
 *     responses:
 *       200:
 *         description: Class timetable retrieved successfully
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
router.get('/class/:classId/section/:sectionId', authMiddleware, getClassTimetable);

/**
 * @swagger
 * /timetable/teacher/{teacherId}:
 *   get:
 *     summary: Get teacher timetable
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *         description: Filter by specific day
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [FIRST, SECOND]
 *         description: Filter by semester
 *     responses:
 *       200:
 *         description: Teacher timetable retrieved successfully
 *       400:
 *         description: Academic session ID required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only view own timetable
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.get('/teacher/:teacherId', authMiddleware, getTeacherTimetable);

/**
 * @swagger
 * /timetable/weekly/class/{classId}/section/{sectionId}:
 *   get:
 *     summary: Get weekly timetable (organized by day)
 *     tags: [Timetable]
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
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [FIRST, SECOND]
 *         description: Filter by semester
 *     responses:
 *       200:
 *         description: Weekly timetable retrieved successfully
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
router.get('/weekly/class/:classId/section/:sectionId', authMiddleware, getWeeklyTimetable);

/**
 * @swagger
 * /timetable/{id}:
 *   put:
 *     summary: Update timetable slot
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Timetable entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               day:
 *                 type: string
 *                 enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *                 description: Day of the week
 *               periodNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Period number (1-12)
 *               subjectId:
 *                 type: string
 *                 description: Subject ID
 *               teacherId:
 *                 type: string
 *                 description: Teacher ID
 *               startTime:
 *                 type: string
 *                 description: Start time in HH:MM format
 *               endTime:
 *                 type: string
 *                 description: End time in HH:MM format
 *               room:
 *                 type: string
 *                 description: Room number
 *               semester:
 *                 type: string
 *                 enum: [FIRST, SECOND]
 *                 description: Semester
 *     responses:
 *       200:
 *         description: Timetable slot updated successfully
 *       400:
 *         description: Bad request or conflict detected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Timetable entry not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, updateTimetableSlot);

/**
 * @swagger
 * /timetable/{id}:
 *   delete:
 *     summary: Delete timetable slot
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Timetable entry ID
 *     responses:
 *       200:
 *         description: Timetable slot deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Timetable entry not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, deleteTimetableSlot);

/**
 * @swagger
 * /timetable/class/{classId}/section/{sectionId}/session/{sessionId}:
 *   delete:
 *     summary: Delete entire class timetable
 *     tags: [Timetable]
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
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *     responses:
 *       200:
 *         description: Class timetable deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Section not found
 *       500:
 *         description: Internal server error
 */
router.delete('/class/:classId/section/:sectionId/session/:sessionId', authMiddleware, deleteClassTimetable);

module.exports = router;
