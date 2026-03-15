const Attendance = require('../models/Attendance');
const TeacherAssignment = require('../models/TeacherAssignment');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const AcademicYear = require('../models/AcademicYear');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

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
  console.log(' BULK ATTENDANCE API CALLED');
  console.log(' Request body:', JSON.stringify(req.body, null, 2));
  console.log(' User info:', { role: req.user?.role, userId: req.user?.id, schoolId: req.user?.schoolId });
  
  const { date, records, classId, sectionId, subjectId, attendanceType = 'daily' } = req.body;
  const { role, id: userId, schoolId } = req.user;

  console.log(' Extracted params:', { date, recordsCount: records?.length, classId, sectionId, subjectId, attendanceType, role, userId, schoolId });

  // Validate inputs
  if (!records || !Array.isArray(records) || records.length === 0) {
    console.log(' Invalid records array:', records);
    return next(new ErrorResponse('Records array is required and cannot be empty', 400));
  }

  // For daily attendance, subjectId is not required
  if (attendanceType === 'daily' && subjectId) {
    console.log(' SubjectId provided for daily attendance');
    return next(new ErrorResponse('SubjectId should not be provided for daily attendance', 400));
  }

  // For subject attendance, subjectId is required
  if (attendanceType === 'subject' && !subjectId) {
    console.log(' SubjectId missing for subject attendance');
    return next(new ErrorResponse('SubjectId is required for subject-wise attendance', 400));
  }

  console.log(' Input validation passed');

  // Role-based authorization
  console.log(' Checking authorization for role:', role);
  if (role === 'superadmin' || role === 'school_admin') {
    console.log(' Admin access granted');
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    console.log(' Teacher authorization check');
    if (attendanceType === 'daily') {
      // For daily attendance - check if teacher is CLASS TEACHER
      console.log(' Checking class teacher assignment');
      const classTeacherAssignment = await ClassTeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        schoolId,
        isActive: true,
      });

      console.log(' Class teacher assignment found:', !!classTeacherAssignment);
      if (!classTeacherAssignment) {
        console.log(' Teacher not authorized as class teacher');
        return next(new ErrorResponse('You are not the class teacher of this section.', 403));
      }
    } else if (attendanceType === 'subject' && subjectId) {
      // For subject-wise attendance
      console.log(' Checking subject assignment');
      const assignment = await TeacherAssignment.findOne({
        teacherId: userId,
        classId,
        sectionId,
        subjectId,
        schoolId,
        isActive: true,
      });

      console.log(' Subject assignment found:', !!assignment);
      if (!assignment) {
        console.log(' Teacher not authorized for subject');
        return next(new ErrorResponse('You are not authorized to mark attendance for this subject.', 403));
      }
    }
  } else {
    console.log(' Unauthorized role:', role);
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  console.log('✅ Authorization passed');

  // Get current academic year for the school
  console.log('🎓 Getting current academic year for school:', schoolId);
  const currentAcademicYear = await AcademicYear.getCurrentYear(schoolId);
  
  if (!currentAcademicYear) {
    console.log('❌ No current academic year found for school');
    return next(new ErrorResponse('No current academic year found. Please set up an academic year first.', 400));
  }
  
  console.log('✅ Found current academic year:', currentAcademicYear.name, 'ID:', currentAcademicYear._id);

  console.log('📋 Creating bulk records from', records.length, 'records');
  const bulkRecords = records.map((record, index) => {
    console.log(`📝 Processing record ${index + 1}:`, record);
    return {
      ...record,
      enrollmentId: record.studentId, // Using studentId as enrollmentId for now
      classId,
      sectionId,
      subjectId: attendanceType === 'subject' ? subjectId : null,
      attendanceType,
      schoolId,
      markedBy: userId,
      date,
      academicYearId: currentAcademicYear._id, // Add the missing academicYearId
    };
  });

  console.log('📊 Prepared bulk records:', bulkRecords.length, 'records to insert');
  console.log('🗄️ Inserting into database...');

  try {
    console.log('🗄️ Inserting into database...');
    console.log('📋 Bulk records to insert:', JSON.stringify(bulkRecords, null, 2));
    
    const attendance = await Attendance.insertMany(bulkRecords, { ordered: false });
    console.log('✅ Successfully inserted', attendance.length, 'attendance records');
    console.log('📤 Sending response with data length:', attendance.length);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    console.log('❌ Database insertion error:', error);
    console.log('❌ Error details:', error.message);
    if (error.errors) {
      console.log('❌ Validation errors:', error.errors);
    }
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