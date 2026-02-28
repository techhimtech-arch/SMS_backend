const Attendance = require('../models/Attendance');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// POST /api/attendance
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { studentId, date, status } = req.body;

  // Validate student belongs to the same school
  if (!req.user.schoolId) {
    return next(new ErrorResponse('Unauthorized access', 403));
  }

  // Check for duplicate attendance
  const existingAttendance = await Attendance.findOne({
    studentId,
    date,
    schoolId: req.user.schoolId,
  });

  if (existingAttendance) {
    return next(new ErrorResponse('Attendance already marked for this student on this date', 400));
  }

  const attendance = await Attendance.create({
    studentId,
    classId: req.body.classId,
    sectionId: req.body.sectionId,
    schoolId: req.user.schoolId,
    date,
    status,
    markedBy: req.user.userId,
  });

  res.status(201).json({ success: true, data: attendance });
});

// POST /api/attendance/bulk
exports.bulkMarkAttendance = asyncHandler(async (req, res, next) => {
  const { date, records } = req.body;

  const bulkRecords = records.map((record) => ({
    ...record,
    schoolId: req.user.schoolId,
    markedBy: req.user.userId,
    date,
  }));

  // Validate all students belong to the same school
  const invalidRecords = bulkRecords.filter(
    (record) => record.schoolId !== req.user.schoolId
  );

  if (invalidRecords.length > 0) {
    return next(new ErrorResponse('Some students do not belong to this school', 400));
  }

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