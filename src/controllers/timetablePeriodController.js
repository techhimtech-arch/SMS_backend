const asyncHandler = require('express-async-handler');
const TimetablePeriod = require('../models/TimetablePeriod');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/response');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @desc    Create a new timetable period
 * @route   POST /api/v1/timetable-periods
 * @access  Private/School Admin
 */
const createPeriod = asyncHandler(async (req, res) => {
  try {
    const {
      academicYearId,
      periodNumber,
      label,
      startTime,
      endTime,
      isBreak,
      type
    } = req.body;

    const schoolId = req.user.schoolId;

    // Check if period number already exists for this school and academic year
    const existingPeriod = await TimetablePeriod.findOne({
      schoolId,
      academicYearId,
      periodNumber,
      isDeleted: { $ne: true }
    });

    if (existingPeriod) {
      return sendError(res, 400, `Period number ${periodNumber} already exists for this academic year`);
    }

    const period = await TimetablePeriod.create({
      schoolId,
      academicYearId,
      periodNumber,
      label,
      startTime,
      endTime,
      isBreak,
      type,
      createdBy: req.user.userId
    });

    logger.info('Timetable period created', { periodId: period._id, schoolId });
    return sendSuccess(res, 201, 'Timetable period created successfully', period);
  } catch (error) {
    logger.error('Error creating timetable period', { error: error.message });
    return sendError(res, 500, 'Failed to create timetable period');
  }
});

/**
 * @desc    Get all periods for a school and academic year
 * @route   GET /api/v1/timetable-periods
 * @access  Private
 */
const getPeriods = asyncHandler(async (req, res) => {
  try {
    const { academicYearId } = req.query;
    const schoolId = req.user.schoolId;

    if (!academicYearId) {
      return sendError(res, 400, 'Academic Year ID is required');
    }

    const periods = await TimetablePeriod.find({
      schoolId,
      academicYearId,
      isDeleted: { $ne: true }
    }).sort({ periodNumber: 1 });

    return sendSuccess(res, 200, 'Periods retrieved successfully', periods);
  } catch (error) {
    logger.error('Error fetching periods', { error: error.message });
    return sendError(res, 500, 'Failed to fetch periods');
  }
});

/**
 * @desc    Update a timetable period
 * @route   PUT /api/v1/timetable-periods/:id
 * @access  Private/School Admin
 */
const updatePeriod = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const schoolId = req.user.schoolId;

    const period = await TimetablePeriod.findOne({ _id: id, schoolId, isDeleted: { $ne: true } });
    if (!period) {
      return sendError(res, 404, 'Period not found');
    }

    // If changing periodNumber, check for duplicates
    if (updateData.periodNumber && updateData.periodNumber !== period.periodNumber) {
      const existing = await TimetablePeriod.findOne({
        schoolId,
        academicYearId: period.academicYearId,
        periodNumber: updateData.periodNumber,
        _id: { $ne: id },
        isDeleted: { $ne: true }
      });
      if (existing) {
        return sendError(res, 400, `Period number ${updateData.periodNumber} already exists`);
      }
    }

    const updatedPeriod = await TimetablePeriod.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: req.user.userId },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 200, 'Period updated successfully', updatedPeriod);
  } catch (error) {
    logger.error('Error updating period', { error: error.message });
    return sendError(res, 500, 'Failed to update period');
  }
});

/**
 * @desc    Delete a period (soft delete)
 * @route   DELETE /api/v1/timetable-periods/:id
 * @access  Private/School Admin
 */
const deletePeriod = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const period = await TimetablePeriod.findOne({ _id: id, schoolId, isDeleted: { $ne: true } });
    if (!period) {
      return sendError(res, 404, 'Period not found');
    }

    period.isDeleted = true;
    period.deletedAt = new Date();
    period.deletedBy = req.user.userId;
    await period.save();

    return sendSuccess(res, 200, 'Period deleted successfully');
  } catch (error) {
    logger.error('Error deleting period', { error: error.message });
    return sendError(res, 500, 'Failed to delete period');
  }
});

/**
 * @desc    Bulk create/sync periods for an academic year
 * @route   POST /api/v1/timetable-periods/bulk
 * @access  Private/School Admin
 */
const bulkSyncPeriods = asyncHandler(async (req, res) => {
  try {
    const { academicYearId, periods } = req.body;
    const schoolId = req.user.schoolId;

    if (!Array.isArray(periods)) {
      return sendError(res, 400, 'Periods array is required');
    }

    // For simplicity, we'll mark old ones as deleted and insert new ones
    // Or we could do a more complex merge. Let's do a clear and insert for the session.
    await TimetablePeriod.updateMany(
      { schoolId, academicYearId, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.userId }
    );

    const periodsWithMetadata = periods.map(p => ({
      ...p,
      schoolId,
      academicYearId,
      createdBy: req.user.userId
    }));

    const createdPeriods = await TimetablePeriod.insertMany(periodsWithMetadata);

    return sendSuccess(res, 201, 'Periods synced successfully', createdPeriods);
  } catch (error) {
    logger.error('Error bulk syncing periods', { error: error.message });
    return sendError(res, 500, 'Failed to sync periods');
  }
});

module.exports = {
  createPeriod: [authorizePermissions([PERMISSIONS.TIMETABLE_CREATE]), createPeriod],
  getPeriods: [authorizePermissions([PERMISSIONS.TIMETABLE_READ]), getPeriods],
  updatePeriod: [authorizePermissions([PERMISSIONS.TIMETABLE_UPDATE]), updatePeriod],
  deletePeriod: [authorizePermissions([PERMISSIONS.TIMETABLE_DELETE]), deletePeriod],
  bulkSyncPeriods: [authorizePermissions([PERMISSIONS.TIMETABLE_CREATE]), bulkSyncPeriods]
};
