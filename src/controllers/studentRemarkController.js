const asyncHandler = require('express-async-handler');
const StudentRemark = require('../models/StudentRemark');
const StudentProfile = require('../models/StudentProfile');
const TeacherAssignment = require('../models/TeacherAssignment');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const AcademicYear = require('../models/AcademicYear');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

/**
 * @desc    Add remark for a student
 * @route   POST /api/v1/student-remarks
 * @access  Private (Teacher, School Admin)
 */
const addStudentRemark = asyncHandler(async (req, res, next) => {
  const {
    studentId,
    category,
    type,
    title,
    description,
    severity,
    actionTaken,
    followUpRequired,
    followUpDate,
    followUpNotes,
    parentNotified
  } = req.body;

  // Get student profile to get class/section info
  const student = await StudentProfile.findOne({
    _id: studentId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  }).populate('currentEnrollment');

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Get current academic year
  const currentAcademicYear = await AcademicYear.findOne({
    schoolId: req.user.schoolId,
    isActive: true
  });

  if (!currentAcademicYear) {
    return next(new ErrorResponse('No active academic year found', 400));
  }

  // Verify teacher has access to this student's class/section
  if (req.user.role === 'teacher') {
    const hasAccess = await TeacherAssignment.findOne({
      teacherId: req.user.userId,
      classId: student.currentEnrollment?.classId,
      sectionId: student.currentEnrollment?.sectionId,
      schoolId: req.user.schoolId
    });

    const isClassTeacher = await ClassTeacherAssignment.findOne({
      teacherId: req.user.userId,
      classId: student.currentEnrollment?.classId,
      sectionId: student.currentEnrollment?.sectionId,
      schoolId: req.user.schoolId
    });

    if (!hasAccess && !isClassTeacher) {
      return next(new ErrorResponse('You do not have access to add remarks for this student', 403));
    }
  }

  const remark = new StudentRemark({
    studentId,
    teacherId: req.user.userId,
    classId: student.currentEnrollment?.classId,
    sectionId: student.currentEnrollment?.sectionId,
    academicYearId: currentAcademicYear._id,
    schoolId: req.user.schoolId,
    category,
    type,
    title,
    description,
    severity: severity || 'MEDIUM',
    actionTaken,
    followUpRequired: followUpRequired || false,
    followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    followUpNotes,
    parentNotified: parentNotified || false
  });

  const savedRemark = await remark.save();

  // Send notification to parent if required
  if (parentNotified && student.parentUserId) {
    await notificationService.sendNotification({
      userId: student.parentUserId,
      title: `New Remark for ${student.firstName} ${student.lastName}`,
      message: `${title}: ${description}`,
      type: 'STUDENT_REMARK',
      data: {
        studentId: student._id,
        remarkId: savedRemark._id,
        category,
        type
      }
    });
  }

  logger.info('Student remark added', {
    requestId: req.requestId,
    studentId,
    teacherId: req.user.userId,
    category,
    type
  });

  res.status(201).json({
    success: true,
    message: 'Student remark added successfully',
    data: savedRemark
  });
});

/**
 * @desc    Get remarks for a student
 * @route   GET /api/v1/student-remarks/student/:studentId
 * @access  Private (Teacher, School Admin, Parent, Student)
 */
const getStudentRemarks = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { page = 1, limit = 20, category, type, status } = req.query;

  // Get current academic year
  const currentAcademicYear = await AcademicYear.findOne({
    schoolId: req.user.schoolId,
    isActive: true
  });

  // Build query
  const query = {
    studentId,
    schoolId: req.user.schoolId,
    academicYearId: currentAcademicYear._id,
    isDeleted: { $ne: true }
  };

  // Apply filters
  if (category) query.category = category;
  if (type) query.type = type;
  if (status) query.status = status;

  // Check access permissions
  if (req.user.role === 'student') {
    // Students can only see their own remarks
    const studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });
    if (!studentProfile || studentProfile._id.toString() !== studentId) {
      return next(new ErrorResponse('Access denied', 403));
    }
  } else if (req.user.role === 'parent') {
    // Parents can only see remarks for their children
    const studentProfile = await StudentProfile.findOne({
      _id: studentId,
      parentUserId: req.user.userId,
      schoolId: req.user.schoolId
    });
    if (!studentProfile) {
      return next(new ErrorResponse('Access denied', 403));
    }
  } else if (req.user.role === 'teacher') {
    // Teachers can only see remarks for students in their classes
    const student = await StudentProfile.findById(studentId).populate('currentEnrollment');
    const hasAccess = await TeacherAssignment.findOne({
      teacherId: req.user.userId,
      classId: student.currentEnrollment?.classId,
      sectionId: student.currentEnrollment?.sectionId,
      schoolId: req.user.schoolId
    });

    const isClassTeacher = await ClassTeacherAssignment.findOne({
      teacherId: req.user.userId,
      classId: student.currentEnrollment?.classId,
      sectionId: student.currentEnrollment?.sectionId,
      schoolId: req.user.schoolId
    });

    if (!hasAccess && !isClassTeacher) {
      return next(new ErrorResponse('Access denied', 403));
    }
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [remarks, total] = await Promise.all([
    StudentRemark.find(query)
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    StudentRemark.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: remarks.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: remarks
  });
});

/**
 * @desc    Get remarks added by teacher
 * @route   GET /api/v1/student-remarks/teacher
 * @access  Private (Teacher, School Admin)
 */
const getTeacherRemarks = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, category, type, status, followUpRequired } = req.query;

  // Build query
  const query = {
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  };

  // Apply filters
  if (category) query.category = category;
  if (type) query.type = type;
  if (status) query.status = status;
  if (followUpRequired === 'true') {
    query.followUpRequired = true;
    query.followUpDate = { $lte: new Date() };
    query.status = { $ne: 'CLOSED' };
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [remarks, total] = await Promise.all([
    StudentRemark.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    StudentRemark.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: remarks.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: remarks
  });
});

/**
 * @desc    Update student remark
 * @route   PUT /api/v1/student-remarks/:remarkId
 * @access  Private (Teacher who created remark, School Admin)
 */
const updateStudentRemark = asyncHandler(async (req, res, next) => {
  const { remarkId } = req.params;
  const {
    title,
    description,
    severity,
    actionTaken,
    followUpRequired,
    followUpDate,
    followUpNotes,
    status,
    parentNotified
  } = req.body;

  const remark = await StudentRemark.findOne({
    _id: remarkId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!remark) {
    return next(new ErrorResponse('Remark not found', 404));
  }

  // Check permissions
  if (req.user.role === 'teacher' && remark.teacherId.toString() !== req.user.userId) {
    return next(new ErrorResponse('You can only update your own remarks', 403));
  }

  // Update fields
  if (title) remark.title = title;
  if (description) remark.description = description;
  if (severity) remark.severity = severity;
  if (actionTaken !== undefined) remark.actionTaken = actionTaken;
  if (followUpRequired !== undefined) remark.followUpRequired = followUpRequired;
  if (followUpDate !== undefined) remark.followUpDate = new Date(followUpDate);
  if (followUpNotes !== undefined) remark.followUpNotes = followUpNotes;
  if (status) remark.status = status;
  if (parentNotified !== undefined) remark.parentNotified = parentNotified;

  const updatedRemark = await remark.save();

  res.status(200).json({
    success: true,
    message: 'Remark updated successfully',
    data: updatedRemark
  });
});

/**
 * @desc    Delete student remark (soft delete)
 * @route   DELETE /api/v1/student-remarks/:remarkId
 * @access  Private (Teacher who created remark, School Admin)
 */
const deleteStudentRemark = asyncHandler(async (req, res, next) => {
  const { remarkId } = req.params;

  const remark = await StudentRemark.findOne({
    _id: remarkId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!remark) {
    return next(new ErrorResponse('Remark not found', 404));
  }

  // Check permissions
  if (req.user.role === 'teacher' && remark.teacherId.toString() !== req.user.userId) {
    return next(new ErrorResponse('You can only delete your own remarks', 403));
  }

  remark.isDeleted = true;
  remark.deletedAt = new Date();
  remark.deletedBy = req.user.userId;
  await remark.save();

  logger.info('Student remark deleted', {
    requestId: req.requestId,
    remarkId,
    deletedBy: req.user.userId
  });

  res.status(200).json({
    success: true,
    message: 'Remark deleted successfully'
  });
});

/**
 * @desc    Get remarks statistics for teacher dashboard
 * @route   GET /api/v1/student-remarks/stats
 * @access  Private (Teacher, School Admin)
 */
const getRemarksStats = asyncHandler(async (req, res, next) => {
  const currentAcademicYear = await AcademicYear.findOne({
    schoolId: req.user.schoolId,
    isActive: true
  });

  const query = {
    schoolId: req.user.schoolId,
    academicYearId: currentAcademicYear._id,
    isDeleted: { $ne: true }
  };

  if (req.user.role === 'teacher') {
    query.teacherId = req.user.userId;
  }

  const [
    totalRemarks,
    positiveRemarks,
    negativeRemarks,
    remarksNeedingFollowUp,
    remarksByCategory
  ] = await Promise.all([
    StudentRemark.countDocuments(query),
    StudentRemark.countDocuments({ ...query, type: 'POSITIVE' }),
    StudentRemark.countDocuments({ ...query, type: 'NEGATIVE' }),
    StudentRemark.countDocuments({
      ...query,
      followUpRequired: true,
      followUpDate: { $lte: new Date() },
      status: { $ne: 'CLOSED' }
    }),
    StudentRemark.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRemarks,
      positiveRemarks,
      negativeRemarks,
      remarksNeedingFollowUp,
      remarksByCategory
    }
  });
});

module.exports = {
  addStudentRemark,
  getStudentRemarks,
  getTeacherRemarks,
  updateStudentRemark,
  deleteStudentRemark,
  getRemarksStats
};
