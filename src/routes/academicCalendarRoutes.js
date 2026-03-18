const express = require('express');
const router = express.Router();
const {
  createCalendarEvent,
  getCalendarEvents,
  getMonthlyCalendar,
  getUpcomingEvents,
  getHolidays,
  getExams,
  updateCalendarEvent,
  deleteCalendarEvent
} = require('../controllers/academicCalendarController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Academic Calendar
 *   description: Academic calendar and event management
 */

/**
 * @swagger
 * /academic-calendar:
 *   post:
 *     summary: Create a new calendar event
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - academicSessionId
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Event title
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Event description
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Event date
 *               type:
 *                 type: string
 *                 enum: [HOLIDAY, EXAM, EVENT, MEETING]
 *                 default: EVENT
 *                 description: Event type
 *               subType:
 *                 type: string
 *                 description: Event subtype
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *                 description: Event priority
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, CANCELLED]
 *                 default: DRAFT
 *                 description: Event status
 *               isRecurring:
 *                 type: boolean
 *                 default: false
 *                 description: Whether event is recurring
 *               recurringPattern:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, YEARLY]
 *                 description: Recurring pattern
 *               recurringEndDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date for recurring events
 *               applicableClasses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of class IDs
 *               applicableSections:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of section IDs
 *               applicableRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [ALL, STUDENTS, TEACHERS, PARENTS, ADMIN, SCHOOL_ADMIN, TEACHER, ACCOUNTANT]
 *                 description: Roles this event applies to
 *               venue:
 *                 type: string
 *                 maxLength: 200
 *                 description: Event venue
 *               startTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *                 description: Start time in HH:MM format
 *               endTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *                 description: End time in HH:MM format
 *               sendNotifications:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to send notifications
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID
 *     responses:
 *       201:
 *         description: Calendar event created successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, createCalendarEvent);

/**
 * @swagger
 * /academic-calendar:
 *   get:
 *     summary: Get calendar events by date range
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [HOLIDAY, EXAM, EVENT, MEETING]
 *         description: Filter by event type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CANCELLED]
 *         description: Filter by event status
 *       - in: query
 *         name: applicableRoles
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by applicable roles
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Calendar events retrieved successfully
 *       400:
 *         description: Bad request or missing parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, getCalendarEvents);

/**
 * @swagger
 * /academic-calendar/monthly/{year}/{month}:
 *   get:
 *     summary: Get monthly calendar
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Year (YYYY)
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [HOLIDAY, EXAM, EVENT, MEETING]
 *         description: Filter by event type
 *       - in: query
 *         name: applicableRoles
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by applicable roles
 *     responses:
 *       200:
 *         description: Monthly calendar retrieved successfully
 *       400:
 *         description: Bad request or invalid date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/monthly/:year/:month', authMiddleware, getMonthlyCalendar);

/**
 * @swagger
 * /academic-calendar/upcoming:
 *   get:
 *     summary: Get upcoming events
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days to look ahead
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [HOLIDAY, EXAM, EVENT, MEETING]
 *         description: Filter by event type
 *       - in: query
 *         name: applicableRoles
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by applicable roles
 *     responses:
 *       200:
 *         description: Upcoming events retrieved successfully
 *       400:
 *         description: Bad request or missing parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/upcoming', authMiddleware, getUpcomingEvents);

/**
 * @swagger
 * /academic-calendar/holidays/{year}:
 *   get:
 *     summary: Get holidays for a year
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Year (YYYY)
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *     responses:
 *       200:
 *         description: Holidays retrieved successfully
 *       400:
 *         description: Bad request or invalid year
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/holidays/:year', authMiddleware, getHolidays);

/**
 * @swagger
 * /academic-calendar/exams/{year}:
 *   get:
 *     summary: Get exams for a year
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Year (YYYY)
 *       - in: query
 *         name: academicSessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: subType
 *         schema:
 *           type: string
 *           enum: [MID_TERM, FINAL_TERM, UNIT_TEST, PRACTICAL, VIVA]
 *         description: Filter by exam subtype
 *     responses:
 *       200:
 *         description: Exams retrieved successfully
 *       400:
 *         description: Bad request or invalid year
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/exams/:year', authMiddleware, getExams);

/**
 * @swagger
 * /academic-calendar/{id}:
 *   put:
 *     summary: Update calendar event
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Event title
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Event description
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Event date
 *               type:
 *                 type: string
 *                 enum: [HOLIDAY, EXAM, EVENT, MEETING]
 *                 description: Event type
 *               subType:
 *                 type: string
 *                 description: Event subtype
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 description: Event priority
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, CANCELLED]
 *                 description: Event status
 *               isRecurring:
 *                 type: boolean
 *                 description: Whether event is recurring
 *               recurringPattern:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, YEARLY]
 *                 description: Recurring pattern
 *               recurringEndDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date for recurring events
 *               applicableClasses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of class IDs
 *               applicableSections:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of section IDs
 *               applicableRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Roles this event applies to
 *               venue:
 *                 type: string
 *                 maxLength: 200
 *                 description: Event venue
 *               startTime:
 *                 type: string
 *                 description: Start time in HH:MM format
 *               endTime:
 *                 type: string
 *                 description: End time in HH:MM format
 *               sendNotifications:
 *                 type: boolean
 *                 description: Whether to send notifications
 *     responses:
 *       200:
 *         description: Calendar event updated successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Calendar event not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, updateCalendarEvent);

/**
 * @swagger
 * /academic-calendar/{id}:
 *   delete:
 *     summary: Delete calendar event
 *     tags: [Academic Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar event ID
 *     responses:
 *       200:
 *         description: Calendar event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Calendar event not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, deleteCalendarEvent);

module.exports = router;
