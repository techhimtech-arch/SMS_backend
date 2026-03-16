const Attendance = require('../models/Attendance');
const TeacherAssignment = require('../models/TeacherAssignment');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const AcademicYear = require('../models/AcademicYear');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// POST /api/attendance (Daily attendance - by class teacher)
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { studentId, date, status, classId, sectionId, subjectId, attendanceType = 'daily' } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Validate student belongs to the same school
  if (!schoolId) {
    return next(new ErrorResponse('Unauthorized access', 403));
  }

  // For daily attendance, subjectId is not required
  if (attendanceType === 'daily' && subjectId) {
    return next(new ErrorResponse('SubjectId should not be provided for daily attendance', 400));
  }

  // For subject attendance, subjectId is required
  if (attendanceType === 'subject' && !subjectId) {
    return next(new ErrorResponse('SubjectId is required for subject-wise attendance', 400));
  }

  // Role-based authorization
  if (role === 'superadmin' || role === 'school_admin') {
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    if (attendanceType === 'daily') {
      // For daily attendance - check if teacher is CLASS TEACHER of this section
      const classTeacherAssignment = await ClassTeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        schoolId,
        isActive: true,
      });

      if (!classTeacherAssignment) {
        return next(new ErrorResponse('You are not the class teacher of this section. Only class teachers can mark daily attendance.', 403));
      }
    } else if (attendanceType === 'subject' && subjectId) {
      // For subject-wise attendance - check subject assignment
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
    }
  } else {
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  // Check for duplicate attendance
  const duplicateQuery = {
    studentId,
    date,
    schoolId,
    attendanceType,
  };
  if (attendanceType === 'subject' && subjectId) {
    duplicateQuery.subjectId = subjectId;
  }

  const existingAttendance = await Attendance.findOne(duplicateQuery);

  if (existingAttendance) {
    return next(new ErrorResponse('Attendance already marked for this student on this date', 400));
  }

  const attendance = await Attendance.create({
    enrollmentId: studentId, // Using studentId as enrollmentId for now
    studentId,
    classId,
    sectionId,
    subjectId: attendanceType === 'subject' ? subjectId : null,
    attendanceType,
    schoolId,
    date,
    status,
    markedBy: userId,
  });

  res.status(201).json({ success: true, data: attendance });
});

// POST /api/attendance/bulk (Bulk daily attendance - by class teacher)
exports.bulkMarkAttendance = asyncHandler(async (req, res, next) => {
  const log = logger.withRequest(req);
  const perf = log.performance('bulk-attendance-marking');
  
  log.info('Bulk attendance marking started', {
    attendanceType: req.body.attendanceType || 'daily',
    recordsCount: req.body.records?.length,
    classId: req.body.classId,
    sectionId: req.body.sectionId,
    date: req.body.date
  });
  
  const { date, records, classId, sectionId, subjectId, attendanceType = 'daily' } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Validate inputs
  if (!records || !Array.isArray(records) || records.length === 0) {
    log.warn('Invalid records array provided', { records });
    return next(new ErrorResponse('Records array is required and cannot be empty', 400));
  }

  // For daily attendance, subjectId is not required
  if (attendanceType === 'daily' && subjectId) {
    log.warn('SubjectId provided for daily attendance', { attendanceType, subjectId });
    return next(new ErrorResponse('SubjectId should not be provided for daily attendance', 400));
  }

  // For subject attendance, subjectId is required
  if (attendanceType === 'subject' && !subjectId) {
    log.warn('SubjectId missing for subject attendance', { attendanceType });
    return next(new ErrorResponse('SubjectId is required for subject-wise attendance', 400));
  }

  log.info('Input validation passed');

  // Role-based authorization
  log.info('Checking authorization', { role });
  if (role === 'superadmin' || role === 'school_admin') {
    log.info('Admin access granted');
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    log.info('Teacher authorization check');
    if (attendanceType === 'daily') {
      // For daily attendance - check if teacher is CLASS TEACHER
      const dbPerf = log.performance('class-teacher-assignment-check');
      const classTeacherAssignment = await ClassTeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        schoolId,
        isActive: true,
      });
      dbPerf.end();

      if (!classTeacherAssignment) {
        logger.security('Unauthorized class teacher access attempt', {
          userId,
          classId,
          sectionId,
          attendanceType
        });
        return next(new ErrorResponse('You are not the class teacher of this section.', 403));
      }
      log.info('Class teacher assignment verified');
    } else if (attendanceType === 'subject' && subjectId) {
      // For subject-wise attendance
      const dbPerf = log.performance('subject-assignment-check');
      const assignment = await TeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        subjectId,
        schoolId,
        isActive: true,
      });
      dbPerf.end();

      if (!assignment) {
        logger.security('Unauthorized subject access attempt', {
          userId,
          classId,
          sectionId,
          subjectId,
          attendanceType
        });
        return next(new ErrorResponse('You are not authorized to mark attendance for this subject.', 403));
      }
      log.info('Subject assignment verified');
    }
  } else {
    logger.security('Unauthorized role access attempt', { role, userId });
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  log.info('Authorization passed');

  // Get current academic year for the school
  const dbPerf = log.performance('academic-year-fetch');
  const currentAcademicYear = await AcademicYear.getCurrentYear(schoolId);
  dbPerf.end();
  
  if (!currentAcademicYear) {
    log.error('No current academic year found', { schoolId });
    return next(new ErrorResponse('No current academic year found. Please set up an academic year first.', 400));
  }
  
  log.info('Current academic year found', { 
    academicYear: currentAcademicYear.name, 
    academicYearId: currentAcademicYear._id 
  });

  // Create bulk records
  const bulkRecords = records.map((record, index) => {
    return {
      ...record,
      enrollmentId: record.studentId,
      classId,
      sectionId,
      subjectId: attendanceType === 'subject' ? subjectId : null,
      attendanceType,
      schoolId,
      markedBy: userId,
      date,
      academicYearId: currentAcademicYear._id,
    };
  });

  log.info('Bulk records prepared', { recordsCount: bulkRecords.length });

  try {
    const insertPerf = log.performance('database-insert');
    const attendance = await Attendance.insertMany(bulkRecords, { ordered: false });
    insertPerf.end();
    
    logger.business('Bulk attendance marked', {
      recordsInserted: attendance.length,
      classId,
      sectionId,
      date,
      markedBy: userId
    });
    
    perf.end({ recordsInserted: attendance.length });
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    log.error('Database insertion failed', { 
      error: error.message,
      stack: error.stack,
      recordsCount: bulkRecords.length 
    });
    return next(new ErrorResponse('Error marking bulk attendance', 500));
  }
});

// GET /api/attendance
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const { date, classId, sectionId, studentId } = req.query;
  const { role, id: userId, schoolId } = req.user;

  // Convert date string to proper Date format for querying
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const query = {
    schoolId,
    date: {
      $gte: startDate,
      $lte: endDate
    },
  };

  // Parent data isolation - only see their own children's attendance
  if (role === 'parent') {
    // Get parent's children
    const Student = require('../models/Student');
    const children = await Student.find({
      parentUserId: userId,
      schoolId,
    }).select('_id');

    if (children.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const childIds = children.map((child) => child._id);
    query.studentId = { $in: childIds };
  } else {
    // For admin/teacher - allow filtering by classId, sectionId, studentId
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (studentId) query.studentId = studentId;
  }

  const attendance = await Attendance.find(query)
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name')
    .populate('markedBy', 'name');

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