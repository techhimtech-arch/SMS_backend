const TeacherAssignment = require('../models/TeacherAssignment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// @desc    Create a new teacher assignment
// @route   POST /api/v1/teacher-assignments
// @access  Private (superadmin, school_admin)
const createAssignment = asyncHandler(async (req, res, next) => {
  const { teacherId, classId, sectionId, subjectId } = req.body;
  const schoolId = req.user.schoolId;
  const academicYearId = req.user.academicYearId;

  if (!academicYearId) {
    return next(
      new ErrorResponse(
        'No current academic year is set for this school. Please set current academic year before assigning teachers.',
        400
      )
    );
  }

  const assignment = await TeacherAssignment.create({
    teacherId,
    academicYearId,
    classId,
    sectionId,
    subjectId,
    schoolId
  });

  res.status(201).json({
    success: true,
    message: 'Teacher assignment created successfully',
    data: assignment
  });
});

// @desc    Get all teacher assignments
// @route   GET /api/v1/teacher-assignments
// @access  Private (superadmin, school_admin, teacher)
const getAssignments = asyncHandler(async (req, res, next) => {
  const { schoolId, role, _id: userId, academicYearId: currentAcademicYearId } = req.user;

  // Pagination
  let page = Number.parseInt(req.query.page, 10) || 1;
  let limit = Number.parseInt(req.query.limit, 10) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  // Build query
  let query = { schoolId: new mongoose.Types.ObjectId(schoolId) };

  // Default to current academic year unless explicitly provided
  // Also include legacy records (missing academicYearId) and backfill them to current year.
  let requestedAcademicYearId = null;
  if (req.query.academicYearId) {
    requestedAcademicYearId = new mongoose.Types.ObjectId(req.query.academicYearId);
    query.academicYearId = requestedAcademicYearId;
  } else if (currentAcademicYearId) {
    requestedAcademicYearId = new mongoose.Types.ObjectId(currentAcademicYearId);
    query.$or = [
      { academicYearId: requestedAcademicYearId },
      { academicYearId: { $exists: false } }
    ];
  }

  // Default to active assignments only (unless explicitly filtering)
  if (req.query.isActive === undefined) {
    query.isActive = true;
  } else {
    query.isActive = req.query.isActive === 'true';
  }

  // Teachers can only see their own assignments
  if (role === 'teacher') {
    query.teacherId = new mongoose.Types.ObjectId(userId);
  }

  // Optional filters (admin only - teacher filter above takes precedence)
  if (role !== 'teacher' && req.query.teacherId) {
    query.teacherId = new mongoose.Types.ObjectId(req.query.teacherId);
  }
  if (req.query.classId) {
    query.classId = new mongoose.Types.ObjectId(req.query.classId);
  }
  if (req.query.sectionId) {
    query.sectionId = new mongoose.Types.ObjectId(req.query.sectionId);
  }

  const [totalCount, assignments] = await Promise.all([
    TeacherAssignment.countDocuments(query),
    TeacherAssignment.find(query)
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
  ]);

  // Backfill legacy records to current year (only when defaulting to current year)
  if (!req.query.academicYearId && requestedAcademicYearId) {
    const legacyIds = assignments
      .filter(a => !a.academicYearId)
      .map(a => a._id);
    if (legacyIds.length > 0) {
      await TeacherAssignment.updateMany(
        { _id: { $in: legacyIds }, academicYearId: { $exists: false } },
        { $set: { academicYearId: requestedAcademicYearId } }
      );
    }
  }

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    count: assignments.length,
    page,
    totalPages,
    data: assignments
  });
});

// @desc    Get single teacher assignment
// @route   GET /api/v1/teacher-assignments/:id
// @access  Private (superadmin, school_admin, teacher - own only)
const getAssignment = asyncHandler(async (req, res, next) => {
  const { schoolId, role, _id: userId } = req.user;

  const assignment = await TeacherAssignment.findOne({
    _id: req.params.id,
    schoolId
  })
    .populate('teacherId', 'name email')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name');

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  // Teachers can only view their own assignments
  if (role === 'teacher' && assignment.teacherId._id.toString() !== userId.toString()) {
    return next(new ErrorResponse('Not authorized to view this assignment', 403));
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Update teacher assignment
// @route   PATCH /api/v1/teacher-assignments/:id
// @access  Private (superadmin, school_admin)
const updateAssignment = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;
  const { teacherId, classId, sectionId, subjectId, isActive } = req.body;

  let assignment = await TeacherAssignment.findOne({
    _id: req.params.id,
    schoolId
  });

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  // Update fields
  if (teacherId) assignment.teacherId = teacherId;
  if (classId) assignment.classId = classId;
  if (sectionId) assignment.sectionId = sectionId;
  if (subjectId) assignment.subjectId = subjectId;
  if (isActive !== undefined) assignment.isActive = isActive;

  await assignment.save();

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: assignment
  });
});

// @desc    Delete teacher assignment (soft delete)
// @route   DELETE /api/v1/teacher-assignments/:id
// @access  Private (superadmin, school_admin)
const deleteAssignment = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;

  const assignment = await TeacherAssignment.findOneAndUpdate(
    { _id: req.params.id, schoolId },
    { isActive: false },
    { new: true }
  );

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully',
    data: {}
  });
});

// @desc    Get assignments by teacher
// @route   GET /api/v1/teacher-assignments/teacher/:teacherId
// @access  Private (superadmin, school_admin)
const getAssignmentsByTeacher = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;

  const assignments = await TeacherAssignment.find({
    teacherId: req.params.teacherId,
    schoolId,
    isActive: true
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name');

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

// @desc    Get assignments by class and section
// @route   GET /api/v1/teacher-assignments/class/:classId/section/:sectionId
// @access  Private (superadmin, school_admin, teacher)
const getAssignmentsByClassAndSection = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.user;
  const { classId, sectionId } = req.params;
  const { academicYearId } = req.query;

  const query = {
    classId: new mongoose.Types.ObjectId(classId),
    sectionId: new mongoose.Types.ObjectId(sectionId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isActive: true
  };

  if (academicYearId) {
    query.academicYearId = new mongoose.Types.ObjectId(academicYearId);
  }

  const assignments = await TeacherAssignment.find(query)
    .populate('teacherId', 'name email')
    .populate('subjectId', 'name code department');

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByTeacher,
  getAssignmentsByClassAndSection
};
