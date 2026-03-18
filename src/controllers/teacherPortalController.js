const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const TeacherAssignment = require('../models/TeacherAssignment');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// GET /api/teacher/profile - Get teacher profile with assignments
exports.getProfile = asyncHandler(async (req, res, next) => {
  const teacher = await User.findOne({
    _id: req.user.userId,
    role: 'teacher',
    schoolId: req.user.schoolId,
  }).select('-password');

  if (!teacher) {
    return next(new ErrorResponse('Teacher not found', 404));
  }

  // Get teacher's subject assignments
  const subjectAssignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name');

  // Get class teacher assignment if any
  const classTeacherAssignment = await ClassTeacherAssignment.findOne({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  res.status(200).json({
    success: true,
    data: {
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        phone: teacher.phone,
        address: teacher.address,
        qualification: teacher.qualification,
        experience: teacher.experience,
      },
      subjectAssignments,
      classTeacherAssignment,
    },
  });
});

// GET /api/teacher/classes - Get classes assigned to teacher
exports.getAssignedClasses = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  // Get subject assignments
  const subjectAssignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get class teacher assignment
  const classTeacherAssignment = await ClassTeacherAssignment.findOne({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  res.status(200).json({
    success: true,
    data: {
      subjectAssignments,
      classTeacherAssignment,
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(subjectAssignments.length / limit),
    },
  });
});

// GET /api/teacher/students - Get students from assigned classes
exports.getAssignedStudents = asyncHandler(async (req, res, next) => {
  const { classId, sectionId, page = 1, limit = 50 } = req.query;

  // Get teacher's assignments to verify access
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No class assignments found for this teacher', 404));
  }

  // Build query for students
  const query = {
    schoolId: req.user.schoolId,
    isActive: true,
  };

  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;

  const students = await StudentProfile.find(query)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .select('admissionNumber firstName lastName gender dateOfBirth email phone parentUserId')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ firstName: 1, lastName: 1 });

  const total = await StudentProfile.countDocuments(query);

  res.status(200).json({
    success: true,
    data: students,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalStudents: total,
    },
  });
});

// GET /api/teacher/attendance - Get attendance for assigned students
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const { classId, sectionId, startDate, endDate, page = 1, limit = 50 } = req.query;

  // Verify teacher has access to this class/section
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No access to this class/section', 403));
  }

  // Build attendance query
  const query = {
    schoolId: req.user.schoolId,
  };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Get students from assigned classes
  const studentQuery = {
    schoolId: req.user.schoolId,
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
  };

  const students = await StudentProfile.find(studentQuery).select('_id');
  const studentIds = students.map(s => s._id);

  if (studentIds.length > 0) {
    query.studentId = { $in: studentIds };
  }

  const attendance = await Attendance.find(query)
    .populate('studentId', 'admissionNumber firstName lastName')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(query);

  res.status(200).json({
    success: true,
    data: attendance,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    },
  });
});

// POST /api/teacher/attendance/mark - Mark attendance for students
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { classId, sectionId, date, attendanceRecords } = req.body;

  // Validate required fields
  if (!classId || !sectionId || !date || !attendanceRecords || attendanceRecords.length === 0) {
    return next(new ErrorResponse('Class, section, date, and attendance records are required', 400));
  }

  // Verify teacher has access to this class/section
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    classId,
    sectionId,
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No access to this class/section', 403));
  }

  const attendanceDate = new Date(date);
  const startOfDay = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate(), 23, 59, 59, 999);

  // Check if attendance already exists for this date and class
  const existingAttendance = await Attendance.find({
    classId,
    sectionId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    schoolId: req.user.schoolId,
  });

  if (existingAttendance.length > 0) {
    return next(new ErrorResponse('Attendance already marked for this date and class', 400));
  }

  // Create attendance records
  const attendanceDocs = attendanceRecords.map(record => ({
    studentId: record.studentId,
    classId,
    sectionId,
    date: attendanceDate,
    status: record.status,
    remarks: record.remarks || '',
    markedBy: req.user.userId,
    schoolId: req.user.schoolId,
  }));

  const createdAttendance = await Attendance.insertMany(attendanceDocs);

  res.status(201).json({
    success: true,
    message: `Attendance marked for ${createdAttendance.length} students`,
    data: createdAttendance,
  });
});

// PUT /api/teacher/attendance/update - Update attendance record
exports.updateAttendance = asyncHandler(async (req, res, next) => {
  const { attendanceId, status, remarks } = req.body;

  if (!attendanceId || !status) {
    return next(new ErrorResponse('Attendance ID and status are required', 400));
  }

  // Find attendance record
  const attendance = await Attendance.findOne({
    _id: attendanceId,
    schoolId: req.user.schoolId,
  }).populate('classId').populate('sectionId');

  if (!attendance) {
    return next(new ErrorResponse('Attendance record not found', 404));
  }

  // Verify teacher has access to this class/section
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    classId: attendance.classId._id,
    sectionId: attendance.sectionId._id,
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No access to this class/section', 403));
  }

  // Update attendance
  attendance.status = status;
  attendance.remarks = remarks || attendance.remarks;
  attendance.updatedBy = req.user.userId;
  await attendance.save();

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    data: attendance,
  });
});

// GET /api/teacher/exams - Get exams for assigned classes
exports.getExams = asyncHandler(async (req, res, next) => {
  const { classId, sectionId, page = 1, limit = 20 } = req.query;

  // Get teacher's assignments
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No class assignments found', 404));
  }

  // Build query
  const query = {
    schoolId: req.user.schoolId,
    isActive: true,
  };

  if (classId) query.classId = classId;

  const exams = await Exam.find(query)
    .populate('classId', 'name')
    .populate('subjectId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ examDate: -1 });

  const total = await Exam.countDocuments(query);

  res.status(200).json({
    success: true,
    data: exams,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalExams: total,
    },
  });
});

// GET /api/teacher/results - Get results for assigned students
exports.getResults = asyncHandler(async (req, res, next) => {
  const { classId, sectionId, examId, subjectId, page = 1, limit = 50 } = req.query;

  // Get teacher's assignments
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
    ...(subjectId && { subjectId }),
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No access to this class/section/subject', 403));
  }

  // Build query
  const query = {
    schoolId: req.user.schoolId,
  };

  if (examId) query.examId = examId;
  if (subjectId) query.subjectId = subjectId;

  // If class/section specified, get students from those classes
  if (classId || sectionId) {
    const studentQuery = {
      schoolId: req.user.schoolId,
      ...(classId && { classId }),
      ...(sectionId && { sectionId }),
    };
    const students = await StudentProfile.find(studentQuery).select('_id');
    const studentIds = students.map(s => s._id);
    if (studentIds.length > 0) {
      query.studentId = { $in: studentIds };
    }
  }

  const results = await Result.find(query)
    .populate('studentId', 'admissionNumber firstName lastName')
    .populate('examId', 'name examDate')
    .populate('subjectId', 'name')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Result.countDocuments(query);

  res.status(200).json({
    success: true,
    data: results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    },
  });
});

// POST /api/teacher/results/add - Add exam results
exports.addResult = asyncHandler(async (req, res, next) => {
  const {
    examId,
    subjectId,
    classId,
    sectionId,
    results,
  } = req.body;

  // Validate required fields
  if (!examId || !subjectId || !classId || !sectionId || !results || results.length === 0) {
    return next(new ErrorResponse('Exam, subject, class, section, and results are required', 400));
  }

  // Verify teacher has access to this class/section/subject
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    classId,
    sectionId,
    subjectId,
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No access to this class/section/subject', 403));
  }

  // Check if results already exist
  const existingResults = await Result.find({
    examId,
    subjectId,
    schoolId: req.user.schoolId,
    studentId: { $in: results.map(r => r.studentId) },
  });

  if (existingResults.length > 0) {
    return next(new ErrorResponse('Results already exist for some students in this exam and subject', 400));
  }

  // Create result documents
  const resultDocs = results.map(result => ({
    studentId: result.studentId,
    examId,
    subjectId,
    classId,
    sectionId,
    marksObtained: result.marksObtained,
    maxMarks: result.maxMarks,
    grade: result.grade,
    remarks: result.remarks || '',
    enteredBy: req.user.userId,
    schoolId: req.user.schoolId,
  }));

  const createdResults = await Result.insertMany(resultDocs);

  res.status(201).json({
    success: true,
    message: `Results added for ${createdResults.length} students`,
    data: createdResults,
  });
});

// PUT /api/teacher/results/update - Update result
exports.updateResult = asyncHandler(async (req, res, next) => {
  const { resultId, marksObtained, maxMarks, grade, remarks } = req.body;

  if (!resultId) {
    return next(new ErrorResponse('Result ID is required', 400));
  }

  // Find result record
  const result = await Result.findOne({
    _id: resultId,
    schoolId: req.user.schoolId,
  }).populate('subjectId').populate('classId').populate('sectionId');

  if (!result) {
    return next(new ErrorResponse('Result record not found', 404));
  }

  // Verify teacher has access to this class/section/subject
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    classId: result.classId._id,
    sectionId: result.sectionId._id,
    subjectId: result.subjectId._id,
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No access to this class/section/subject', 403));
  }

  // Update result
  if (marksObtained !== undefined) result.marksObtained = marksObtained;
  if (maxMarks !== undefined) result.maxMarks = maxMarks;
  if (grade !== undefined) result.grade = grade;
  if (remarks !== undefined) result.remarks = remarks;
  result.updatedBy = req.user.userId;
  await result.save();

  res.status(200).json({
    success: true,
    message: 'Result updated successfully',
    data: result,
  });
});

// GET /api/teacher/dashboard - Get teacher dashboard stats
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user.userId;
  const schoolId = req.user.schoolId;

  // Get teacher's assignments
  const assignments = await TeacherAssignment.find({
    teacherId,
    schoolId,
  });

  const classIds = [...new Set(assignments.map(a => a.classId.toString()))];
  const sectionIds = [...new Set(assignments.map(a => a.sectionId.toString()))];

  // Get stats in parallel
  const [
    totalStudents,
    todayAttendance,
    pendingResults,
    totalExams,
  ] = await Promise.all([
    // Total students in assigned classes
    StudentProfile.countDocuments({
      schoolId,
      classId: { $in: classIds },
      isActive: true,
    }),
    // Today's attendance count
    Attendance.countDocuments({
      schoolId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      classId: { $in: classIds },
    }),
    // Pending results (exams without results for assigned subjects)
    Result.countDocuments({
      schoolId,
      enteredBy: teacherId,
    }),
    // Total exams for assigned classes
    Exam.countDocuments({
      schoolId,
      classId: { $in: classIds },
      isActive: true,
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      todayAttendance,
      pendingResults,
      totalExams,
      totalAssignments: assignments.length,
    },
  });
});
