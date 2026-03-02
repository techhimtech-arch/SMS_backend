const Attendance = require('../models/Attendance');
const TeacherAssignment = require('../models/TeacherAssignment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// POST /api/attendance
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { studentId, date, status, classId, sectionId, subjectId } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Validate student belongs to the same school
  if (!schoolId) {
    return next(new ErrorResponse('Unauthorized access', 403));
  }

  // Role-based authorization
  if (role === 'superadmin' || role === 'school_admin') {
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    // Verify teacher assignment
    const assignment = await TeacherAssignment.findOne({
      teacherId: userId,
      classId,
      sectionId,
      subjectId,
      schoolId,
      isActive: true,
    });

    if (!assignment) {
      return next(new ErrorResponse('You are not authorized to mark attendance for this subject.', 403));
    }
  } else {
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  // Check for duplicate attendance
  const existingAttendance = await Attendance.findOne({
    studentId,
    date,
    schoolId,
  });

  if (existingAttendance) {
    return next(new ErrorResponse('Attendance already marked for this student on this date', 400));
  }

  const attendance = await Attendance.create({
    studentId,
    classId,
    sectionId,
    subjectId,
    schoolId,
    date,
    status,
    markedBy: userId,
  });

  res.status(201).json({ success: true, data: attendance });
});

// POST /api/attendance/bulk
exports.bulkMarkAttendance = asyncHandler(async (req, res, next) => {
  const { date, records, classId, sectionId, subjectId } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Role-based authorization
  if (role === 'superadmin' || role === 'school_admin') {
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    // Verify teacher assignment
    const assignment = await TeacherAssignment.findOne({
      teacherId: userId,
      classId,
      sectionId,
      subjectId,
      schoolId,
      isActive: true,
    });

    if (!assignment) {
      return next(new ErrorResponse('You are not authorized to mark attendance for this subject.', 403));
    }
  } else {
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  const bulkRecords = records.map((record) => ({
    ...record,
    classId,
    sectionId,
    subjectId,
    schoolId,
    markedBy: userId,
    date,
  }));

  try {
    const attendance = await Attendance.insertMany(bulkRecords, { ordered: false });
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    return next(new ErrorResponse('Error marking bulk attendance', 500));
  }
});

// GET /api/attendance
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const { date, classId, sectionId } = req.query;

  const query = {
    schoolId: req.user.schoolId,
    date,
  };

  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;

  const attendance = await Attendance.find(query)
    .populate('studentId', 'firstName lastName');

  res.status(200).json({ success: true, data: attendance });
});

// DELETE /api/attendance/:id
exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse('Attendance not found', 404));
  }

  if (attendance.schoolId.toString() !== req.user.schoolId.toString()) {
    return next(new ErrorResponse('Unauthorized to delete this attendance', 403));
  }

  await attendance.remove();

  res.status(200).json({ success: true, data: {} });
});