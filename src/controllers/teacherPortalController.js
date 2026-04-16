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
const Enrollment = require('../models/Enrollment');
const AcademicYear = require('../models/AcademicYear');
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

  // Build query for enrollments
  const enrollmentQuery = {
    schoolId: req.user.schoolId,
    status: 'ENROLLED',
    isDeleted: { $ne: true },
  };

  if (classId) enrollmentQuery.classId = classId;
  if (sectionId) enrollmentQuery.sectionId = sectionId;

  // Get enrollments and populate student information
  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate({
      path: 'studentId',
      match: { isActive: true },
      select: 'admissionNumber firstName lastName gender dateOfBirth email phone parentUserId'
    })
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ 'studentId.firstName': 1, 'studentId.lastName': 1 });

  // Filter out enrollments where studentId is null (due to match condition)
  const validEnrollments = enrollments.filter(enrollment => enrollment.studentId != null);

  // Transform the data to return student information
  const students = validEnrollments.map(enrollment => ({
    ...enrollment.studentId.toObject(),
    classId: enrollment.classId,
    sectionId: enrollment.sectionId,
    rollNumber: enrollment.rollNumber,
    enrollmentId: enrollment._id
  }));

  const total = await Enrollment.countDocuments(enrollmentQuery);

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

  // Get students from assigned classes through enrollments
  const enrollmentQuery = {
    schoolId: req.user.schoolId,
    status: 'ENROLLED',
    isDeleted: { $ne: true },
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
  };

  const enrollments = await Enrollment.find(enrollmentQuery).select('studentId');
  const studentIds = enrollments.map(e => e.studentId);

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

  // Get enrollment information for all students
  const studentIds = attendanceRecords.map(record => record.studentId);
  const enrollments = await Enrollment.find({
    studentId: { $in: studentIds },
    classId,
    sectionId,
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  });

  // Get current academic year
  const currentAcademicYear = await AcademicYear.findOne({
    schoolId: req.user.schoolId,
    isActive: true
  });

  if (!currentAcademicYear) {
    return next(new ErrorResponse('No active academic year found', 400));
  }

  // Check if attendance already exists for this date and class
  const existingAttendance = await Attendance.find({
    enrollmentId: { $in: enrollments.map(e => e._id) },
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    academicYearId: currentAcademicYear._id,
    schoolId: req.user.schoolId,
  });

  if (existingAttendance.length > 0) {
    return next(new ErrorResponse('Attendance already marked for this date and class', 400));
  }

  // Create attendance records with required fields
  const attendanceDocs = attendanceRecords.map(record => {
    const enrollment = enrollments.find(e => e.studentId.toString() === record.studentId);
    if (!enrollment) {
      throw new Error(`Student ${record.studentId} is not enrolled in this class/section`);
    }
    
    return {
      enrollmentId: enrollment._id,
      studentId: record.studentId,
      classId,
      sectionId,
      academicYearId: currentAcademicYear._id,
      date: attendanceDate,
      status: record.status,
      remarks: record.remarks || '',
      markedBy: req.user.userId,
      schoolId: req.user.schoolId,
    };
  });

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

  // If class/section specified, get students from those classes through enrollments
  if (classId || sectionId) {
    const enrollmentQuery = {
      schoolId: req.user.schoolId,
      status: 'ENROLLED',
      isDeleted: { $ne: true },
      ...(classId && { classId }),
      ...(sectionId && { sectionId }),
    };
    const enrollments = await Enrollment.find(enrollmentQuery).select('studentId');
    const studentIds = enrollments.map(e => e.studentId);
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
    Enrollment.countDocuments({
      schoolId,
      classId: { $in: classIds },
      status: 'ENROLLED',
      isDeleted: { $ne: true },
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

// GET /api/teacher/homework - Get homework assignments for teacher
exports.getHomework = asyncHandler(async (req, res, next) => {
  const { classId, sectionId, subjectId, status, page = 1, limit = 20 } = req.query;

  // Get teacher's assignments to verify access
  const assignments = await TeacherAssignment.find({
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
    ...(subjectId && { subjectId }),
  });

  if (assignments.length === 0) {
    return next(new ErrorResponse('No class assignments found for this teacher', 404));
  }

  // Build query for assignments (homework)
  const query = {
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  };

  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;
  if (subjectId) query.subjectId = subjectId;
  if (status) query.status = status;

  const Assignment = require('../models/Assignment');
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [homework, total] = await Promise.all([
    Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ dueDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Assignment.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: homework.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: homework
  });
});

// POST /api/teacher/homework - Create new homework assignment
exports.createHomework = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    subjectId,
    classId,
    sectionId,
    dueDate,
    maxMarks,
    attachments,
    allowLateSubmission,
    lateSubmissionPenalty
  } = req.body;

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

  const Assignment = require('../models/Assignment');
  const homework = new Assignment({
    title,
    description,
    subjectId,
    classId,
    sectionId,
    teacherId: req.user.userId,
    dueDate: new Date(dueDate),
    maxMarks,
    attachments: attachments || [],
    allowLateSubmission: allowLateSubmission || false,
    lateSubmissionPenalty: lateSubmissionPenalty || 0,
    createdBy: req.user.userId,
    status: 'PUBLISHED' // Auto-publish homework
  });

  const savedHomework = await homework.save();

  // Send notifications to students
  const Enrollment = require('../models/Enrollment');
  const enrollments = await Enrollment.find({
    classId,
    sectionId,
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  }).populate('studentId', 'userId');

  const notificationService = require('../services/notificationService');
  const notificationPromises = enrollments.map(enrollment => 
    notificationService.sendNotification({
      userId: enrollment.studentId.userId,
      title: 'New Homework Assigned',
      message: `${title} - Due: ${new Date(dueDate).toLocaleDateString()}`,
      type: 'HOMEWORK',
      data: {
        homeworkId: savedHomework._id,
        subjectId,
        classId,
        sectionId,
        dueDate
      }
    })
  );

  await Promise.all(notificationPromises);

  logger.info('Homework created', {
    requestId: req.requestId,
    homeworkId: savedHomework._id,
    teacherId: req.user.userId,
    classId,
    sectionId
  });

  res.status(201).json({
    success: true,
    message: 'Homework assigned successfully',
    data: savedHomework
  });
});

// GET /api/teacher/homework/:homeworkId/submissions - Get homework submissions
exports.getHomeworkSubmissions = asyncHandler(async (req, res, next) => {
  const { homeworkId } = req.params;
  const { status, page = 1, limit = 50 } = req.query;

  // Verify homework exists and teacher has access
  const Assignment = require('../models/Assignment');
  const homework = await Assignment.findOne({
    _id: homeworkId,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!homework) {
    return next(new ErrorResponse('Homework not found or access denied', 404));
  }

  // Build query for submissions
  const query = {
    assignmentId: homeworkId,
    isDeleted: { $ne: true }
  };

  if (status) query.status = status;

  const AssignmentSubmission = require('../models/AssignmentSubmission');
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [submissions, total] = await Promise.all([
    AssignmentSubmission.find(query)
      .populate('studentId', 'admissionNumber firstName lastName')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    AssignmentSubmission.countDocuments(query)
  ]);

  // Get students who haven't submitted
  const Enrollment = require('../models/Enrollment');
  const totalStudents = await Enrollment.countDocuments({
    classId: homework.classId,
    sectionId: homework.sectionId,
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  });

  const submittedStudentIds = submissions.map(s => s.studentId._id);
  const pendingSubmissions = await Enrollment.find({
    classId: homework.classId,
    sectionId: homework.sectionId,
    studentId: { $nin: submittedStudentIds },
    status: 'ENROLLED',
    isDeleted: { $ne: true }
  }).populate('studentId', 'admissionNumber firstName lastName');

  res.status(200).json({
    success: true,
    data: {
      homework,
      submissions,
      pendingSubmissions,
      statistics: {
        totalStudents,
        submittedCount: submissions.length,
        pendingCount: pendingSubmissions.length,
        submissionRate: totalStudents > 0 ? ((submissions.length / totalStudents) * 100).toFixed(1) : 0
      }
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limitNum),
      totalSubmissions: total
    }
  });
});

// PUT /api/teacher/homework/:homeworkId/grade - Grade homework submission
exports.gradeHomework = asyncHandler(async (req, res, next) => {
  const { homeworkId } = req.params;
  const { submissionId, marks, grade, feedback } = req.body;

  // Verify homework exists and teacher has access
  const Assignment = require('../models/Assignment');
  const homework = await Assignment.findOne({
    _id: homeworkId,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true }
  });

  if (!homework) {
    return next(new ErrorResponse('Homework not found or access denied', 404));
  }

  // Find and update submission
  const AssignmentSubmission = require('../models/AssignmentSubmission');
  const submission = await AssignmentSubmission.findOne({
    _id: submissionId,
    assignmentId: homeworkId,
    isDeleted: { $ne: true }
  });

  if (!submission) {
    return next(new ErrorResponse('Submission not found', 404));
  }

  submission.marksObtained = marks;
  submission.grade = grade;
  submission.feedback = feedback;
  submission.gradedBy = req.user.userId;
  submission.gradedAt = new Date();
  submission.status = 'GRADED';

  const gradedSubmission = await submission.save();

  // Send notification to student
  const StudentProfile = require('../models/StudentProfile');
  const student = await StudentProfile.findById(submission.studentId);
  if (student && student.userId) {
    const notificationService = require('../services/notificationService');
    await notificationService.sendNotification({
      userId: student.userId,
      title: 'Homework Graded',
      message: `Your homework "${homework.title}" has been graded. Marks: ${marks}/${homework.maxMarks}`,
      type: 'HOMEWORK_GRADED',
      data: {
        homeworkId,
        submissionId,
        marks,
        grade
      }
    });
  }

  logger.info('Homework graded', {
    requestId: req.requestId,
    homeworkId,
    submissionId,
    teacherId: req.user.userId,
    marks
  });

  res.status(200).json({
    success: true,
    message: 'Homework graded successfully',
    data: gradedSubmission
  });
});

// GET /api/teacher/homework/stats - Get homework statistics
exports.getHomeworkStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user.userId;
  const schoolId = req.user.schoolId;

  // Get teacher's assignments
  const assignments = await TeacherAssignment.find({
    teacherId,
    schoolId,
  });

  const Assignment = require('../models/Assignment');
  const AssignmentSubmission = require('../models/AssignmentSubmission');

  const [
    totalHomework,
    activeHomework,
    pendingGrading,
    totalSubmissions,
    recentSubmissions
  ] = await Promise.all([
    // Total homework created
    Assignment.countDocuments({
      teacherId,
      schoolId,
      isDeleted: { $ne: true }
    }),
    // Active homework (not past due date)
    Assignment.countDocuments({
      teacherId,
      schoolId,
      dueDate: { $gte: new Date() },
      status: 'PUBLISHED',
      isDeleted: { $ne: true }
    }),
    // Pending grading
    AssignmentSubmission.countDocuments({
      assignmentId: { $in: await Assignment.find({ teacherId, schoolId, isDeleted: { $ne: true } }).distinct('_id') },
      status: 'SUBMITTED',
      isDeleted: { $ne: true }
    }),
    // Total submissions received
    AssignmentSubmission.countDocuments({
      assignmentId: { $in: await Assignment.find({ teacherId, schoolId, isDeleted: { $ne: true } }).distinct('_id') },
      isDeleted: { $ne: true }
    }),
    // Recent submissions (last 7 days)
    AssignmentSubmission.find({
      assignmentId: { $in: await Assignment.find({ teacherId, schoolId, isDeleted: { $ne: true } }).distinct('_id') },
      submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isDeleted: { $ne: true }
    })
    .populate('assignmentId', 'title')
    .populate('studentId', 'firstName lastName')
    .sort({ submittedAt: -1 })
    .limit(10)
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalHomework,
      activeHomework,
      pendingGrading,
      totalSubmissions,
      totalAssignments: assignments.length,
      recentSubmissions
    }
  });
});
