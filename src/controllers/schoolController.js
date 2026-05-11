const asyncHandler = require('express-async-handler');
const School = require('../models/School');
const logger = require('../utils/logger');

/**
 * @desc    Get current school details (via token)
 * @route   GET /api/v1/schools/me
 * @access  Private
 */
const getMySchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.schoolId);
  
  if (!school) {
    return res.status(404).json({ success: false, message: 'School not found' });
  }

  res.status(200).json({ success: true, data: school });
});

/**
 * @desc    Get school by ID
 * @route   GET /api/v1/schools/:id
 * @access  Private
 */
const getSchoolById = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return res.status(404).json({ success: false, message: 'School not found' });
  }

  res.status(200).json({ success: true, data: school });
});

/**
 * @desc    Update school details
 * @route   PATCH /api/v1/schools/me
 * @access  Private/School Admin
 */
const updateMySchool = asyncHandler(async (req, res) => {
  // Only school_admin or superadmin can update
  if (req.user.role !== 'school_admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update school details'
    });
  }

  const allowedUpdates = ['name', 'email', 'phone', 'address', 'logo', 'signature'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const school = await School.findByIdAndUpdate(
    req.user.schoolId,
    updates,
    { new: true, runValidators: true }
  );

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School not found'
    });
  }

  logger.info('School details updated', {
    schoolId: school._id,
    updatedBy: req.user.userId,
    fields: Object.keys(updates)
  });

  res.status(200).json({
    success: true,
    message: 'School details updated successfully',
    data: school
  });
});

module.exports = {
  getMySchool,
  getSchoolById,
  updateMySchool
};
