const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Section = require('../models/Section');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Timetable Service - Business logic for timetable management
 */

/**
 * Create a timetable slot with conflict validation
 */
const createTimetableSlot = async (slotData, schoolId, userId) => {
  try {
    const {
      classId,
      sectionId,
      day,
      periodNumber,
      subjectId,
      teacherId,
      startTime,
      endTime,
      room,
      academicYearId,
      semester = 'FIRST'
    } = slotData;

    // Validate class exists
    const classExists = await Class.findOne({
      _id: classId,
      schoolId,
      isDeleted: { $ne: true }
    });

    if (!classExists) {
      throw new Error('Invalid class ID or class not found');
    }

    // Validate section exists and belongs to class
    const sectionExists = await Section.findOne({
      _id: sectionId,
      classId,
      schoolId,
      isDeleted: { $ne: true }
    });

    if (!sectionExists) {
      throw new Error('Invalid section ID or section does not belong to this class');
    }

    // Validate teacher exists
    const teacherExists = await User.findOne({
      _id: teacherId,
      schoolId,
      role: 'teacher',
      isDeleted: { $ne: true }
    });

    if (!teacherExists) {
      throw new Error('Invalid teacher ID or teacher not found');
    }

    // Check for teacher conflict
    const teacherConflict = await Timetable.checkTeacherConflict(
      teacherId,
      day.toUpperCase(),
      periodNumber,
      academicYearId,
      schoolId
    );

    if (teacherConflict) {
      throw new Error(`Teacher conflict: Teacher is already assigned during ${day} period ${periodNumber}`);
    }

    // Check for class conflict
    const classConflict = await Timetable.checkClassConflict(
      classId,
      sectionId,
      day.toUpperCase(),
      periodNumber,
      academicYearId,
      schoolId
    );

    if (classConflict) {
      throw new Error(`Class conflict: Class already has another subject during ${day} period ${periodNumber}`);
    }

    // Create timetable entry
    const timetableEntry = await Timetable.create({
      classId,
      sectionId,
      day: day.toUpperCase(),
      periodNumber,
      subjectId,
      teacherId,
      startTime,
      endTime,
      room,
      academicYearId,
      semester: semester.toUpperCase(),
      schoolId,
      createdBy: userId
    });

    logger.info('Timetable slot created successfully', {
      timetableId: timetableEntry._id,
      classId,
      sectionId,
      day,
      periodNumber,
      createdBy: userId
    });

    return timetableEntry;
  } catch (error) {
    logger.error('Error creating timetable slot', {
      error: error.message,
      slotData,
      schoolId,
      userId
    });
    throw error;
  }
};

/**
 * Create multiple timetable slots (bulk)
 */
const createBulkTimetable = async (slots, academicYearId, schoolId, userId) => {
  try {
    if (!Array.isArray(slots) || slots.length === 0) {
      throw new Error('Timetable slots array is required and must not be empty');
    }

    // Validate all slots before insertion
    for (const slot of slots) {
      const teacherConflict = await Timetable.checkTeacherConflict(
        slot.teacherId,
        slot.day.toUpperCase(),
        slot.periodNumber,
        academicYearId,
        schoolId
      );

      if (teacherConflict) {
        throw new Error(
          `Teacher conflict in slot ${slots.indexOf(slot) + 1}: ` +
          `Teacher is already assigned during ${slot.day} period ${slot.periodNumber}`
        );
      }

      const classConflict = await Timetable.checkClassConflict(
        slot.classId,
        slot.sectionId,
        slot.day.toUpperCase(),
        slot.periodNumber,
        academicYearId,
        schoolId
      );

      if (classConflict) {
        throw new Error(
          `Class conflict in slot ${slots.indexOf(slot) + 1}: ` +
          `Class already has another subject during ${slot.day} period ${slot.periodNumber}`
        );
      }
    }

    // Add school ID, academic session ID, and created by to all slots
    const slotsWithMetadata = slots.map(slot => ({
      ...slot,
      day: slot.day.toUpperCase(),
      semester: (slot.semester || 'FIRST').toUpperCase(),
      schoolId,
      academicYearId,
      createdBy: userId
    }));

    // Bulk insert
    const createdSlots = await Timetable.insertMany(slotsWithMetadata);

    logger.info('Bulk timetable slots created successfully', {
      count: createdSlots.length,
      academicYearId,
      createdBy: userId
    });

    return createdSlots;
  } catch (error) {
    logger.error('Error creating bulk timetable slots', {
      error: error.message,
      slotCount: slots.length,
      schoolId,
      userId
    });
    throw error;
  }
};

/**
 * Get class timetable with filtering
 */
const getClassTimetable = async (classId, sectionId, academicYearId, schoolId, filters = {}) => {
  try {
    const { day, semester } = filters;

    // Build filter
    const filter = {
      classId,
      sectionId,
      academicYearId,
      schoolId,
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
      .sort({ periodNumber: 1 })
      .lean();

    logger.info('Class timetable retrieved', {
      classId,
      sectionId,
      count: timetable.length
    });

    return timetable;
  } catch (error) {
    logger.error('Error getting class timetable', {
      error: error.message,
      classId,
      sectionId,
      academicYearId,
      schoolId
    });
    throw error;
  }
};

/**
 * Get teacher timetable with filtering
 */
const getTeacherTimetable = async (teacherId, academicYearId, schoolId, filters = {}) => {
  try {
    const { day, semester } = filters;

    // Build filter
    const filter = {
      teacherId,
      academicYearId,
      schoolId,
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
      .sort({ day: 1, periodNumber: 1 })
      .lean();

    logger.info('Teacher timetable retrieved', {
      teacherId,
      count: timetable.length
    });

    return timetable;
  } catch (error) {
    logger.error('Error getting teacher timetable', {
      error: error.message,
      teacherId,
      academicYearId,
      schoolId
    });
    throw error;
  }
};

/**
 * Get weekly timetable grouped by days
 * Returns format: { MONDAY: [...], TUESDAY: [...], ... }
 */
const getWeeklyTimetable = async (classId, sectionId, academicYearId, schoolId, semester = null) => {
  try {
    const weeklyData = await Timetable.getWeeklyTimetable(
      classId,
      sectionId,
      academicYearId,
      schoolId
    );

    // Format the response into a day-based object
    const formattedTimetable = {};

    weeklyData.forEach(dayGroup => {
      const dayName = dayGroup._id;
      formattedTimetable[dayName] = dayGroup.periods || [];

      // Apply semester filter if specified
      if (semester) {
        formattedTimetable[dayName] = formattedTimetable[dayName].filter(period =>
          period.timetableEntry && period.timetableEntry.semester === semester.toUpperCase()
        );
      }
    });

    logger.info('Weekly timetable retrieved', {
      classId,
      sectionId,
      daysCount: Object.keys(formattedTimetable).length
    });

    return formattedTimetable;
  } catch (error) {
    logger.error('Error getting weekly timetable', {
      error: error.message,
      classId,
      sectionId,
      academicYearId,
      schoolId
    });
    throw error;
  }
};

/**
 * Update timetable slot with conflict validation
 */
const updateTimetableSlot = async (timetableId, updateData, schoolId, userId) => {
  try {
    const timetableEntry = await Timetable.findOne({
      _id: timetableId,
      schoolId,
      isDeleted: { $ne: true }
    });

    if (!timetableEntry) {
      throw new Error('Timetable entry not found');
    }

    // If updating day, period, teacher, or class/section, check for conflicts
    if (updateData.day || updateData.periodNumber || updateData.teacherId ||
        updateData.classId || updateData.sectionId) {
      
      const checkDay = (updateData.day || timetableEntry.day).toUpperCase();
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
        schoolId,
        timetableId
      );

      if (teacherConflict) {
        throw new Error(`Teacher conflict: Teacher is already assigned during ${checkDay} period ${checkPeriod}`);
      }

      // Check class conflict
      const classConflict = await Timetable.checkClassConflict(
        checkClass,
        checkSection,
        checkDay,
        checkPeriod,
        checkSession,
        schoolId,
        timetableId
      );

      if (classConflict) {
        throw new Error(`Class conflict: Class already has another subject during ${checkDay} period ${checkPeriod}`);
      }
    }

    // Prepare update data
    const allowedUpdates = [
      'classId', 'sectionId', 'day', 'periodNumber', 'subjectId', 
      'teacherId', 'startTime', 'endTime', 'room', 'semester'
    ];

    const updateObj = { updatedBy: userId };
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'day') {
          updateObj[field] = updateData[field].toUpperCase();
        } else if (field === 'semester') {
          updateObj[field] = updateData[field].toUpperCase();
        } else {
          updateObj[field] = updateData[field];
        }
      }
    });

    const updatedEntry = await Timetable.findByIdAndUpdate(
      timetableId,
      updateObj,
      { new: true, runValidators: true }
    ).populate([
      { path: 'subjectId', select: 'name code department' },
      { path: 'teacherId', select: 'name email' }
    ]);

    logger.info('Timetable slot updated successfully', {
      timetableId,
      updatedFields: Object.keys(updateObj),
      updatedBy: userId
    });

    return updatedEntry;
  } catch (error) {
    logger.error('Error updating timetable slot', {
      error: error.message,
      timetableId,
      schoolId,
      userId
    });
    throw error;
  }
};

/**
 * Delete timetable slot (soft delete)
 */
const deleteTimetableSlot = async (timetableId, schoolId, userId) => {
  try {
    const timetableEntry = await Timetable.findOne({
      _id: timetableId,
      schoolId,
      isDeleted: { $ne: true }
    });

    if (!timetableEntry) {
      throw new Error('Timetable entry not found');
    }

    // Soft delete
    timetableEntry.isDeleted = true;
    timetableEntry.deletedAt = new Date();
    timetableEntry.deletedBy = userId;
    await timetableEntry.save();

    logger.info('Timetable slot deleted successfully', {
      timetableId,
      deletedBy: userId
    });

    return { success: true, message: 'Timetable slot deleted successfully' };
  } catch (error) {
    logger.error('Error deleting timetable slot', {
      error: error.message,
      timetableId,
      schoolId,
      userId
    });
    throw error;
  }
};

/**
 * Delete entire class timetable for a session
 */
const deleteClassTimetable = async (classId, sectionId, sessionId, schoolId, userId) => {
  try {
    const result = await Timetable.updateMany(
      {
        classId,
        sectionId,
        academicYearId: sessionId,
        schoolId,
        isDeleted: { $ne: true }
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
      }
    );

    logger.info('Class timetable deleted successfully', {
      classId,
      sectionId,
      sessionId,
      deletedCount: result.modifiedCount,
      deletedBy: userId
    });

    return {
      success: true,
      message: 'Class timetable deleted successfully',
      deletedCount: result.modifiedCount
    };
  } catch (error) {
    logger.error('Error deleting class timetable', {
      error: error.message,
      classId,
      sectionId,
      sessionId,
      schoolId,
      userId
    });
    throw error;
  }
};

/**
 * Validate timetable slot data
 */
const validateTimetableSlot = (slotData) => {
  const errors = [];

  // Required fields
  if (!slotData.classId) errors.push('classId is required');
  if (!slotData.sectionId) errors.push('sectionId is required');
  if (!slotData.day) errors.push('day is required');
  if (!slotData.periodNumber) errors.push('periodNumber is required');
  if (!slotData.subjectId) errors.push('subjectId is required');
  if (!slotData.teacherId) errors.push('teacherId is required');
  if (!slotData.startTime) errors.push('startTime is required');
  if (!slotData.endTime) errors.push('endTime is required');
  if (!slotData.academicYearId) errors.push('academicYearId is required');

  // Time format validation (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (slotData.startTime && !timeRegex.test(slotData.startTime)) {
    errors.push('startTime must be in HH:MM format (24-hour)');
  }
  if (slotData.endTime && !timeRegex.test(slotData.endTime)) {
    errors.push('endTime must be in HH:MM format (24-hour)');
  }

  // Day validation
  const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  if (slotData.day && !validDays.includes(slotData.day.toUpperCase())) {
    errors.push(`day must be one of: ${validDays.join(', ')}`);
  }

  // Period number validation
  if (slotData.periodNumber && (slotData.periodNumber < 1 || slotData.periodNumber > 12)) {
    errors.push('periodNumber must be between 1 and 12');
  }

  // Semester validation
  if (slotData.semester && !['FIRST', 'SECOND'].includes(slotData.semester.toUpperCase())) {
    errors.push('semester must be either FIRST or SECOND');
  }

  return errors;
};

module.exports = {
  createTimetableSlot,
  createBulkTimetable,
  getClassTimetable,
  getTeacherTimetable,
  getWeeklyTimetable,
  updateTimetableSlot,
  deleteTimetableSlot,
  deleteClassTimetable,
  validateTimetableSlot
};
