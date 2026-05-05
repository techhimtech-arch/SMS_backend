const asyncHandler = require('express-async-handler');
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Section = require('../models/Section');
const logger = require('../utils/logger');
const { sendSuccess, sendError, sendPaginatedResponse } = require('../utils/response');
const { getPaginatedResults, buildSearchFilter } = require('../utils/pagination');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @desc    Create timetable slot
 * @route    POST /api/v1/timetable
 * @access   Private/School Admin
 */
const createTimetableSlot = asyncHandler(async (req, res) => {
  try {
    const {
      classId,
      sectionId,
      day,
      periodNumber,
      period,
      subjectId,
      teacherId,
      startTime,
      endTime,
      room,
      academicYearId,
      semester = 'FIRST'
    } = req.body;

    // Normalize period field (accept both 'period' and 'periodNumber')
    const finalPeriodNumber = periodNumber || period;

    // Normalize day (uppercase)
    const finalDay = day ? day.toUpperCase() : day;

    // Debug log
    logger.info('Timetable create request received', {
      finalPeriodNumber,
      periodNumber,
      period,
      finalDay,
      day
    });

    // Validate required fields
    if (!academicYearId || academicYearId.trim() === '') {
      return sendError(res, 400, 'Academic Session ID is required');
    }

    if (!classId || classId.trim() === '') {
      return sendError(res, 400, 'Class ID is required');
    }

    if (!sectionId || sectionId.trim() === '') {
      return sendError(res, 400, 'Section ID is required');
    }

    if (!day) {
      return sendError(res, 400, 'Day is required');
    }

    const periodNum = parseInt(finalPeriodNumber);
    if (!finalPeriodNumber && finalPeriodNumber !== 0) {
      return sendError(res, 400, 'Period Number is required');
    }
    if (isNaN(periodNum) || periodNum < 1 || periodNum > 12) {
      return sendError(res, 400, 'Period Number must be a number between 1 and 12');
    }

    if (!subjectId || subjectId.trim() === '') {
      return sendError(res, 400, 'Subject ID is required');
    }

    if (!teacherId || teacherId.trim() === '') {
      return sendError(res, 400, 'Teacher ID is required');
    }

    if (!startTime || startTime.trim() === '') {
      return sendError(res, 400, 'Start Time is required (format: HH:MM)');
    }

    if (!endTime || endTime.trim() === '') {
      return sendError(res, 400, 'End Time is required (format: HH:MM)');
    }

    // Validate class and section exist
    const classExists = await Class.findOne({
      _id: classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!classExists) {
      return sendError(res, 400, 'Invalid class ID or class not found');
    }

    const sectionExists = await Section.findOne({
      _id: sectionId,
      classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!sectionExists) {
      return sendError(res, 400, 'Invalid section ID or section not found');
    }

    // Check for teacher conflict
    const teacherConflict = await Timetable.checkTeacherConflict(
      teacherId,
      finalDay,
      periodNum,
      academicYearId,
      req.user.schoolId
    );

    if (teacherConflict) {
      return sendError(res, 400, `Teacher conflict: Teacher is already assigned during ${finalDay} period ${periodNum}`);
    }

    // Check for class conflict
    const classConflict = await Timetable.checkClassConflict(
      classId,
      sectionId,
      finalDay,
      periodNum,
      academicYearId,
      req.user.schoolId
    );

    if (classConflict) {
      return sendError(res, 400, `Class conflict: Class already has another subject during ${finalDay} period ${periodNum}`);
    }

    // Create timetable entry
    const timetableEntry = await Timetable.create({
      classId,
      sectionId,
      day: finalDay,
      periodNumber: periodNum,
      subjectId,
      teacherId,
      startTime,
      endTime,
      room,
      academicYearId,
      semester,
      schoolId: req.user.schoolId,
      createdBy: req.user.userId
    });

    logger.info('Timetable slot created successfully', {
      timetableId: timetableEntry._id,
      classId,
      sectionId,
      day,
      periodNumber,
      createdBy: req.user.userId
    });

    return sendSuccess(res, 201, 'Timetable slot created successfully', timetableEntry);

  } catch (error) {
    logger.error('Failed to create timetable slot', {
      error: error.message,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to create timetable slot');
  }
});

/**
 * @desc    Create multiple timetable slots (bulk)
 * @route    POST /api/v1/timetable/bulk
 * @access   Private/School Admin
 */
const createBulkTimetable = asyncHandler(async (req, res) => {
  try {
    const { timetableSlots, academicYearId } = req.body;

    // Validate academicYearId
    if (!academicYearId || academicYearId.trim() === '') {
      return sendError(res, 400, 'Academic Session ID is required');
    }

    if (!Array.isArray(timetableSlots) || timetableSlots.length === 0) {
      return sendError(res, 400, 'Timetable slots array is required');
    }

    // Validate all slots before insertion
    for (const slot of timetableSlots) {
      // Normalize period field (accept both 'period' and 'periodNumber')
      const finalPeriodNumber = slot.periodNumber || slot.period;
      const finalDay = slot.day ? slot.day.toUpperCase() : slot.day;
      
      // Validate required slot fields
      if (!finalPeriodNumber && finalPeriodNumber !== 0) {
        return sendError(res, 400, 'Period Number is required for all slots');
      }
      const periodNum = parseInt(finalPeriodNumber);
      if (isNaN(periodNum) || periodNum < 1 || periodNum > 12) {
        return sendError(res, 400, 'Period Number must be a number between 1 and 12 for all slots');
      }
      if (!finalDay) {
        return sendError(res, 400, 'Day is required for all slots');
      }
      if (!slot.teacherId) {
        return sendError(res, 400, 'Teacher ID is required for all slots');
      }
      if (!slot.classId || !slot.sectionId) {
        return sendError(res, 400, 'Class ID and Section ID are required for all slots');
      }

      const teacherConflict = await Timetable.checkTeacherConflict(
        slot.teacherId,
        finalDay,
        periodNum,
        academicYearId,
        req.user.schoolId
      );

      if (teacherConflict) {
        return sendError(res, 400, `Teacher conflict: Teacher is already assigned during ${finalDay} period ${periodNum}`);
      }

      const classConflict = await Timetable.checkClassConflict(
        slot.classId,
        slot.sectionId,
        finalDay,
        periodNum,
        academicYearId,
        req.user.schoolId
      );

      if (classConflict) {
        return sendError(res, 400, `Class conflict: Class already has another subject during ${finalDay} period ${periodNum}`);
      }
    }

    // Add school ID and created by to all slots, normalize period field and day
    const slotsWithMetadata = timetableSlots.map(slot => {
      const normalizedSlot = { ...slot };
      // Normalize period field if needed
      if (normalizedSlot.period && !normalizedSlot.periodNumber) {
        normalizedSlot.periodNumber = normalizedSlot.period;
      }
      // Normalize day to uppercase
      if (normalizedSlot.day) {
        normalizedSlot.day = normalizedSlot.day.toUpperCase();
      }
      return {
        ...normalizedSlot,
        schoolId: req.user.schoolId,
        academicYearId,
        createdBy: req.user.userId
      };
    });

    // Bulk insert
    const createdSlots = await Timetable.insertMany(slotsWithMetadata);

    logger.info('Bulk timetable slots created successfully', {
      count: createdSlots.length,
      academicYearId,
      createdBy: req.user.userId
    });

    return sendSuccess(res, 201, 'Timetable slots created successfully', createdSlots);

  } catch (error) {
    logger.error('Failed to create bulk timetable slots', {
      error: error.message,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to create timetable slots');
  }
});

/**
 * @desc    Get class timetable
 * @route    GET /api/v1/timetable/class/:classId/section/:sectionId
 * @access   Private/School Admin, Teacher, Student
 */
const getClassTimetable = asyncHandler(async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { academicYearId, day, semester } = req.query;

    if (!academicYearId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Validate section belongs to class
    const section = await Section.findOne({
      _id: sectionId,
      classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!section) {
      return sendError(res, 404, 'Section not found or does not belong to this class');
    }

    // Build filter
    let filter = {
      classId,
      sectionId,
      academicYearId,
      schoolId: req.user.schoolId,
      isActive: true,
      isDeleted: { $ne: true }
    };

    if (day) {
      filter.day = day.toUpperCase();
    }

    if (semester) {
      filter.semester = semester.toUpperCase();
    }

    // Get timetable
    const timetable = await Timetable.find(filter)
      .populate([
        { path: 'subjectId', select: 'name code department credits' },
        { path: 'teacherId', select: 'name email' }
      ])
      .sort({ periodNumber: 1 });

    return sendSuccess(res, 200, 'Class timetable retrieved successfully', timetable);

  } catch (error) {
    logger.error('Failed to get class timetable', {
      error: error.message,
      classId: req.params.classId,
      sectionId: req.params.sectionId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get class timetable');
  }
});

/**
 * @desc    Get teacher timetable
 * @route    GET /api/v1/timetable/teacher/:teacherId
 * @access   Private/School Admin, Teacher (own timetable)
 */
const getTeacherTimetable = asyncHandler(async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYearId, day, semester } = req.query;

    // Check authorization (teacher can only view own timetable)
    if (req.user.role === 'teacher' && teacherId !== req.user.userId) {
      return sendError(res, 403, 'You can only view your own timetable');
    }

    if (!academicYearId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Build filter
    let filter = {
      teacherId,
      academicYearId,
      schoolId: req.user.schoolId,
      isActive: true,
      isDeleted: { $ne: true }
    };

    if (day) {
      filter.day = day.toUpperCase();
    }

    if (semester) {
      filter.semester = semester.toUpperCase();
    }

    // Get timetable
    const timetable = await Timetable.find(filter)
      .populate([
        { path: 'classId', select: 'name' },
        { path: 'sectionId', select: 'name' },
        { path: 'subjectId', select: 'name code department' }
      ])
      .sort({ day: 1, periodNumber: 1 });

    return sendSuccess(res, 200, 'Teacher timetable retrieved successfully', timetable);

  } catch (error) {
    logger.error('Failed to get teacher timetable', {
      error: error.message,
      teacherId: req.params.teacherId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get teacher timetable');
  }
});

/**
 * @desc    Get weekly timetable (organized by day)
 * @route    GET /api/v1/timetable/weekly/class/:classId/section/:sectionId
 * @access   Private/School Admin, Teacher, Student
 */
const getWeeklyTimetable = asyncHandler(async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { academicYearId, semester } = req.query;

    if (!academicYearId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Validate section belongs to class
    const section = await Section.findOne({
      _id: sectionId,
      classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!section) {
      return sendError(res, 404, 'Section not found or does not belong to this class');
    }

    // Get weekly timetable
    const weeklyTimetable = await Timetable.getWeeklyTimetable(
      classId,
      sectionId,
      academicYearId,
      req.user.schoolId
    );

    let filter = {};
    if (semester) {
      filter.semester = semester.toUpperCase();
      // Apply semester filter to the results
      weeklyTimetable.forEach(day => {
        day.periods = day.periods.filter(period => 
          period.timetableEntry && period.timetableEntry.semester === semester.toUpperCase()
        );
      });
    }

    return sendSuccess(res, 200, 'Weekly timetable retrieved successfully', weeklyTimetable);

  } catch (error) {
    logger.error('Failed to get weekly timetable', {
      error: error.message,
      classId: req.params.classId,
      sectionId: req.params.sectionId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get weekly timetable');
  }
});

/**
 * @desc    Update timetable slot
 * @route    PUT /api/v1/timetable/:id
 * @access   Private/School Admin
 */
const updateTimetableSlot = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const timetableEntry = await Timetable.findOne({
      _id: id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!timetableEntry) {
      return sendError(res, 404, 'Timetable entry not found');
    }

    // Check for conflicts if changing day, period, teacher, or class
    if (updateData.day || updateData.periodNumber || updateData.teacherId || 
        updateData.classId || updateData.sectionId) {
      
      const checkDay = updateData.day || timetableEntry.day;
      const checkPeriod = updateData.periodNumber || timetableEntry.periodNumber;
      const checkTeacher = updateData.teacherId || timetableEntry.teacherId;
      const checkClass = updateData.classId || timetableEntry.classId;
      const checkSection = updateData.sectionId || timetableEntry.sectionId;
      const checkSession = updateData.academicYearId || timetableEntry.academicYearId;

      // Check teacher conflict
      const teacherConflict = await Timetable.checkTeacherConflict(
        checkTeacher,
        checkDay,
        checkPeriod,
        checkSession,
        req.user.schoolId,
        id
      );

      if (teacherConflict) {
        return sendError(res, 400, `Teacher conflict: Teacher is already assigned during ${checkDay} period ${checkPeriod}`);
      }

      // Check class conflict
      const classConflict = await Timetable.checkClassConflict(
        checkClass,
        checkSection,
        checkDay,
        checkPeriod,
        checkSession,
        req.user.schoolId,
        id
      );

      if (classConflict) {
        return sendError(res, 400, `Class conflict: Class already has another subject during ${checkDay} period ${checkPeriod}`);
      }
    }

    // Prepare update data
    const allowedUpdates = [
      'classId', 'sectionId', 'day', 'periodNumber', 'subjectId', 
      'teacherId', 'startTime', 'endTime', 'room', 'semester'
    ];

    const updateObj = { updatedBy: req.user.userId };
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'day') {
          updateObj[field] = updateData[field].toUpperCase();
        } else {
          updateObj[field] = updateData[field];
        }
      }
    });

    const updatedEntry = await Timetable.findByIdAndUpdate(
      id,
      updateObj,
      { new: true, runValidators: true }
    );

    logger.info('Timetable slot updated successfully', {
      timetableId: id,
      updatedFields: Object.keys(updateObj),
      updatedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Timetable slot updated successfully', updatedEntry);

  } catch (error) {
    logger.error('Failed to update timetable slot', {
      error: error.message,
      timetableId: req.params.id,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to update timetable slot');
  }
});

/**
 * @desc    Delete timetable slot (soft delete)
 * @route    DELETE /api/v1/timetable/:id
 * @access   Private/School Admin
 */
const deleteTimetableSlot = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const timetableEntry = await Timetable.findOne({
      _id: id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!timetableEntry) {
      return sendError(res, 404, 'Timetable entry not found');
    }

    // Soft delete
    timetableEntry.isDeleted = true;
    timetableEntry.deletedAt = new Date();
    timetableEntry.deletedBy = req.user.userId;
    await timetableEntry.save();

    logger.info('Timetable slot deleted successfully', {
      timetableId: id,
      deletedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Timetable slot deleted successfully');

  } catch (error) {
    logger.error('Failed to delete timetable slot', {
      error: error.message,
      timetableId: req.params.id,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to delete timetable slot');
  }
});

/**
 * @desc    Delete entire timetable for class/section/session
 * @route    DELETE /api/v1/timetable/class/:classId/section/:sectionId/session/:sessionId
 * @access   Private/School Admin
 */
const deleteClassTimetable = asyncHandler(async (req, res) => {
  try {
    const { classId, sectionId, sessionId } = req.params;

    // Validate section belongs to class
    const section = await Section.findOne({
      _id: sectionId,
      classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!section) {
      return sendError(res, 404, 'Section not found or does not belong to this class');
    }

    // Soft delete all timetable entries
    const result = await Timetable.updateMany(
      {
        classId,
        sectionId,
        academicYearId: sessionId,
        schoolId: req.user.schoolId,
        isDeleted: { $ne: true }
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.userId
      }
    );

    logger.info('Class timetable deleted successfully', {
      classId,
      sectionId,
      sessionId,
      deletedCount: result.modifiedCount,
      deletedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Class timetable deleted successfully', {
      deletedCount: result.modifiedCount
    });

  } catch (error) {
    logger.error('Failed to delete class timetable', {
      error: error.message,
      classId: req.params.classId,
      sectionId: req.params.sectionId,
      sessionId: req.params.sessionId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to delete class timetable');
  }
});

module.exports = {
  createTimetableSlot: [
    authorizePermissions([PERMISSIONS.TIMETABLE_CREATE]),
    createTimetableSlot
  ],
  createBulkTimetable: [
    authorizePermissions([PERMISSIONS.TIMETABLE_CREATE]),
    createBulkTimetable
  ],
  getClassTimetable: [
    authorizePermissions([PERMISSIONS.TIMETABLE_READ]),
    getClassTimetable
  ],
  getTeacherTimetable: [
    authorizePermissions([PERMISSIONS.TIMETABLE_READ]),
    getTeacherTimetable
  ],
  getWeeklyTimetable: [
    authorizePermissions([PERMISSIONS.TIMETABLE_READ]),
    getWeeklyTimetable
  ],
  updateTimetableSlot: [
    authorizePermissions([PERMISSIONS.TIMETABLE_UPDATE]),
    updateTimetableSlot
  ],
  deleteTimetableSlot: [
    authorizePermissions([PERMISSIONS.TIMETABLE_DELETE]),
    deleteTimetableSlot
  ],
  deleteClassTimetable: [
    authorizePermissions([PERMISSIONS.TIMETABLE_DELETE]),
    deleteClassTimetable
  ]
};
