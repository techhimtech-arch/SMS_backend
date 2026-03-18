const asyncHandler = require('express-async-handler');
const AcademicCalendar = require('../models/AcademicCalendar');
const logger = require('../utils/logger');
const { sendSuccess, sendError, sendPaginatedResponse } = require('../utils/response');
const { getPaginatedResults, buildSearchFilter } = require('../utils/pagination');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @desc    Create academic calendar event
 * @route    POST /api/v1/academic-calendar
 * @access   Private/School Admin
 */
const createCalendarEvent = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      type = 'EVENT',
      subType,
      priority = 'MEDIUM',
      status = 'DRAFT',
      isRecurring = false,
      recurringPattern = null,
      recurringEndDate = null,
      applicableClasses = [],
      applicableSections = [],
      applicableRoles = ['ALL'],
      venue,
      startTime,
      endTime,
      sendNotifications = true,
      academicSessionId
    } = req.body;

    // Validate date is not in the past for published events
    if (status === 'PUBLISHED' && new Date(date) < new Date()) {
      return sendError(res, 400, 'Cannot publish events with past dates');
    }

    // Validate recurring pattern
    if (isRecurring && !recurringPattern) {
      return sendError(res, 400, 'Recurring pattern is required when event is recurring');
    }

    if (recurringEndDate && new Date(recurringEndDate) <= new Date(date)) {
      return sendError(res, 400, 'Recurring end date must be after the first occurrence');
    }

    // Create calendar event
    const calendarEvent = await AcademicCalendar.create({
      title: title.trim(),
      description: description?.trim(),
      date: new Date(date),
      type: type.toUpperCase(),
      subType,
      priority: priority.toUpperCase(),
      status: status.toUpperCase(),
      isRecurring,
      recurringPattern,
      recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
      applicableClasses,
      applicableSections,
      applicableRoles,
      venue: venue?.trim(),
      startTime,
      endTime,
      sendNotifications,
      academicSessionId,
      schoolId: req.user.schoolId,
      createdBy: req.user.userId
    });

    logger.info('Academic calendar event created successfully', {
      eventId: calendarEvent._id,
      title: calendarEvent.title,
      type: calendarEvent.type,
      date: calendarEvent.date,
      createdBy: req.user.userId
    });

    return sendSuccess(res, 201, 'Calendar event created successfully', calendarEvent);

  } catch (error) {
    logger.error('Failed to create calendar event', {
      error: error.message,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to create calendar event');
  }
});

/**
 * @desc    Get calendar events by date range
 * @route    GET /api/v1/academic-calendar
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const getCalendarEvents = asyncHandler(async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      academicSessionId,
      type,
      status,
      applicableRoles,
      page = 1,
      limit = 50
    } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    if (!startDate || !endDate) {
      return sendError(res, 400, 'Start date and end date are required');
    }

    // Build filter
    let options = {};
    if (type) {
      options.type = type.toUpperCase();
    }
    if (status) {
      options.status = status.toUpperCase();
    }
    if (applicableRoles) {
      const roles = Array.isArray(applicableRoles) ? applicableRoles : [applicableRoles];
      options.applicableRoles = roles.map(role => role.toUpperCase());
    }

    // Get events
    const { data, pagination } = await getPaginatedResults(
      AcademicCalendar,
      {},
      { ...req.query, startDate, endDate, academicSessionId },
      {
        sort: { date: 1, priority: -1 },
        populate: [
          { path: 'applicableClasses', select: 'name' },
          { path: 'applicableSections', select: 'name' },
          { path: 'createdBy', select: 'name email' }
        ]
      }
    );

    // Apply date range filter manually since it's not a simple field filter
    const filteredData = data.filter(event => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });

    // Apply additional filters
    const finalFilteredData = filteredData.filter(event => {
      if (options.type && event.type !== options.type) return false;
      if (options.status && event.status !== options.status) return false;
      if (options.applicableRoles && options.applicableRoles.length > 0) {
        const hasRole = event.applicableRoles.some(role => 
          options.applicableRoles.includes(role)
        );
        if (!hasRole && !event.applicableRoles.includes('ALL')) return false;
      }
      return true;
    });

    return sendPaginatedResponse(res, 'Calendar events retrieved successfully', finalFilteredData, pagination);

  } catch (error) {
    logger.error('Failed to get calendar events', {
      error: error.message,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get calendar events');
  }
});

/**
 * @desc    Get monthly calendar
 * @route    GET /api/v1/academic-calendar/monthly/:year/:month
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const getMonthlyCalendar = asyncHandler(async (req, res) => {
  try {
    const { year, month } = req.params;
    const { academicSessionId, type, applicableRoles } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Validate year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return sendError(res, 400, 'Invalid year');
    }
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return sendError(res, 400, 'Invalid month');
    }

    // Build options
    let options = {};
    if (type) {
      options.type = type.toUpperCase();
    }
    if (applicableRoles) {
      const roles = Array.isArray(applicableRoles) ? applicableRoles : [applicableRoles];
      options.applicableRoles = roles.map(role => role.toUpperCase());
    }

    // Get monthly events
    const events = await AcademicCalendar.findByMonth(
      yearNum,
      monthNum,
      academicSessionId,
      req.user.schoolId,
      options
    );

    return sendSuccess(res, 200, 'Monthly calendar retrieved successfully', events);

  } catch (error) {
    logger.error('Failed to get monthly calendar', {
      error: error.message,
      year: req.params.year,
      month: req.params.month,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get monthly calendar');
  }
});

/**
 * @desc    Get upcoming events
 * @route    GET /api/v1/academic-calendar/upcoming
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const getUpcomingEvents = asyncHandler(async (req, res) => {
  try {
    const { days = 30, academicSessionId, type, applicableRoles } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Build options
    let options = {};
    if (type) {
      options.type = type.toUpperCase();
    }
    if (applicableRoles) {
      const roles = Array.isArray(applicableRoles) ? applicableRoles : [applicableRoles];
      options.applicableRoles = roles.map(role => role.toUpperCase());
    }

    // Get upcoming events
    const events = await AcademicCalendar.getUpcomingEvents(
      parseInt(days),
      academicSessionId,
      req.user.schoolId,
      options
    );

    return sendSuccess(res, 200, 'Upcoming events retrieved successfully', events);

  } catch (error) {
    logger.error('Failed to get upcoming events', {
      error: error.message,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get upcoming events');
  }
});

/**
 * @desc    Get holidays
 * @route    GET /api/v1/academic-calendar/holidays/:year
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const getHolidays = asyncHandler(async (req, res) => {
  try {
    const { year } = req.params;
    const { academicSessionId } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return sendError(res, 400, 'Invalid year');
    }

    // Get holidays
    const holidays = await AcademicCalendar.getHolidays(
      academicSessionId,
      req.user.schoolId,
      yearNum
    );

    return sendSuccess(res, 200, 'Holidays retrieved successfully', holidays);

  } catch (error) {
    logger.error('Failed to get holidays', {
      error: error.message,
      year: req.params.year,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get holidays');
  }
});

/**
 * @desc    Get exams
 * @route    GET /api/v1/academic-calendar/exams/:year
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const getExams = asyncHandler(async (req, res) => {
  try {
    const { year } = req.params;
    const { academicSessionId, subType } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return sendError(res, 400, 'Invalid year');
    }

    // Build options
    let options = { type: 'EXAM' };
    if (subType) {
      options.subType = subType.toUpperCase();
    }

    // Get exams
    const exams = await AcademicCalendar.getExams(
      academicSessionId,
      req.user.schoolId,
      yearNum
    );

    // Filter by subType if provided
    const filteredExams = subType 
      ? exams.filter(exam => exam.subType === subType.toUpperCase())
      : exams;

    return sendSuccess(res, 200, 'Exams retrieved successfully', filteredExams);

  } catch (error) {
    logger.error('Failed to get exams', {
      error: error.message,
      year: req.params.year,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get exams');
  }
});

/**
 * @desc    Update calendar event
 * @route    PUT /api/v1/academic-calendar/:id
 * @access   Private/School Admin
 */
const updateCalendarEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const calendarEvent = await AcademicCalendar.findOne({
      _id: id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!calendarEvent) {
      return sendError(res, 404, 'Calendar event not found');
    }

    // Prepare update data
    const allowedUpdates = [
      'title', 'description', 'date', 'type', 'subType', 'priority', 
      'status', 'isRecurring', 'recurringPattern', 'recurringEndDate',
      'applicableClasses', 'applicableSections', 'applicableRoles',
      'venue', 'startTime', 'endTime', 'sendNotifications'
    ];

    const updateObj = { updatedBy: req.user.userId };
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (['type', 'priority', 'status'].includes(field)) {
          updateObj[field] = updateData[field].toUpperCase();
        } else {
          updateObj[field] = updateData[field];
        }
      }
    });

    const updatedEvent = await AcademicCalendar.findByIdAndUpdate(
      id,
      updateObj,
      { new: true, runValidators: true }
    );

    logger.info('Academic calendar event updated successfully', {
      eventId: id,
      updatedFields: Object.keys(updateObj),
      updatedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Calendar event updated successfully', updatedEvent);

  } catch (error) {
    logger.error('Failed to update calendar event', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to update calendar event');
  }
});

/**
 * @desc    Delete calendar event (soft delete)
 * @route    DELETE /api/v1/academic-calendar/:id
 * @access   Private/School Admin
 */
const deleteCalendarEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const calendarEvent = await AcademicCalendar.findOne({
      _id: id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!calendarEvent) {
      return sendError(res, 404, 'Calendar event not found');
    }

    // Soft delete
    calendarEvent.isDeleted = true;
    calendarEvent.deletedAt = new Date();
    calendarEvent.deletedBy = req.user.userId;
    await calendarEvent.save();

    logger.info('Academic calendar event deleted successfully', {
      eventId: id,
      deletedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Calendar event deleted successfully');

  } catch (error) {
    logger.error('Failed to delete calendar event', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to delete calendar event');
  }
});

module.exports = {
  createCalendarEvent: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_CREATE]),
    createCalendarEvent
  ],
  getCalendarEvents: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_READ]),
    getCalendarEvents
  ],
  getMonthlyCalendar: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_READ]),
    getMonthlyCalendar
  ],
  getUpcomingEvents: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_READ]),
    getUpcomingEvents
  ],
  getHolidays: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_READ]),
    getHolidays
  ],
  getExams: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_READ]),
    getExams
  ],
  updateCalendarEvent: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_UPDATE]),
    updateCalendarEvent
  ],
  deleteCalendarEvent: [
    authorizePermissions([PERMISSIONS.ANNOUNCEMENT_DELETE]),
    deleteCalendarEvent
  ]
};
