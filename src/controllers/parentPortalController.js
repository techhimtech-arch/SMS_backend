const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ParentStudentMapping = require('../models/ParentStudentMapping');
const Student = require('../models/StudentProfile');
const StudentProfile = require('../models/StudentProfile');
const StudentFee = require('../models/StudentFee');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Announcement = require('../models/Announcement');
const AcademicYear = require('../models/AcademicYear');
const StudentRemark = require('../models/StudentRemark');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get parent dashboard data
 * @route   GET /api/v1/parent/dashboard
 * @access  Private (Parent only)
 */
const getParentDashboard = asyncHandler(async (req, res) => {
  // Ensure only parents can access this
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Parent role required.'
    });
  }

  const parentId = req.user.id;
  const schoolId = req.user.schoolId;

  // Get parent's linked students with profile and enrollment data
  const mapping = await ParentStudentMapping.findOne({
    parentId,
    isDeleted: { $ne: true }
  }).populate({
    path: 'studentIds',
    select: 'firstName lastName admissionNumber studentPhoto',
    populate: {
      path: 'currentEnrollment',
      match: { status: 'ENROLLED', schoolId },
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'sectionId', select: 'name' }
      ]
    }
  });
  
  if (!mapping || !mapping.studentIds || mapping.studentIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        linkedStudents: [],
        attendanceSummary: [],
        feeDues: [],
        latestResults: [],
        latestAnnouncements: []
      }
    });
  }

  const studentIds = mapping.studentIds.map(s => s._id.toString());

  // Get attendance summary for all linked students (last 30 days)
  const attendanceSummary = await Promise.all(
    studentIds.map(async (studentId) => {
      const attendance = await Attendance.find({
        studentId,
        schoolId
      }).sort({ date: -1 }).limit(30);

      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const total = attendance.length;

      return {
        studentId,
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    })
  );

  // Get fee dues for all linked students
  const feeDues = await StudentFee.find({
    studentId: { $in: studentIds },
    schoolId,
    isDeleted: { $ne: true }
  }).populate('studentId', 'firstName lastName admissionNumber');

  const feeSummary = feeDues.map(fee => ({
    studentId: fee.studentId._id,
    studentName: `${fee.studentId.firstName} ${fee.studentId.lastName}`,
    totalDue: fee.balanceAmount || 0,
    paidAmount: fee.paidAmount || 0,
    totalAmount: fee.totalAmount || 0,
    status: fee.balanceAmount > 0 ? 'PENDING' : 'PAID'
  }));

  // Get latest results for linked students
  const latestResults = await Result.find({
    studentId: { $in: studentIds },
    schoolId
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('studentId', 'firstName lastName')
    .populate('examId', 'name examDate')
    .populate('subjectId', 'name');

  // Get latest announcements
  const latestAnnouncements = await Announcement.find({
    schoolId,
    status: 'published',
    $or: [
      { targetAudience: 'all' },
      { targetAudience: 'parents' }
    ],
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ]
  })
    .sort({ publishDate: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      linkedStudents: mapping.studentIds
        .filter(s => s !== null)
        .map(student => ({
          _id: student._id,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.admissionNumber || 'Unknown Student',
          admissionNumber: student.admissionNumber,
          studentPhoto: student.studentPhoto,
          class: student.currentEnrollment?.classId?.name || 'No Class',
          section: student.currentEnrollment?.sectionId?.name || 'No Section'
        })),
      attendanceSummary,
      feeDues: feeSummary,
      latestResults: latestResults.map(r => ({
        _id: r._id,
        studentId: r.studentId?._id,
        studentName: r.studentId ? `${r.studentId.firstName || ''} ${r.studentId.lastName || ''}`.trim() : 'Unknown Student',
        examName: r.examId?.name || 'Unknown Exam',
        examDate: r.examId?.examDate,
        subjectName: r.subjectId?.name || 'General',
        marksObtained: r.marksObtained || 0,
        maxMarks: r.maxMarks || 100,
        percentage: r.percentage || 0,
        grade: r.grade || 'N/A'
      })),
      latestAnnouncements
    }
  });
});

/**
 * @desc    Get detailed information for a specific student
 * @route   GET /api/v1/parent/student/:studentId
 * @access  Private (Parent only)
 */
const getStudentDetail = asyncHandler(async (req, res) => {
  // Ensure only parents can access this
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Parent role required.'
    });
  }

  const { studentId } = req.params;
  const parentId = req.user.id;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(parentId, studentId);
  
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student profile with enrollment
  const student = await Student.findById(studentId)
    .populate({
      path: 'currentEnrollment',
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'sectionId', select: 'name' }
      ]
    });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get attendance summary (fix: field is 'studentId' not 'student')
  const attendanceRecords = await Attendance.find({
    studentId
  }).sort({ date: -1 }).limit(30);

  const attendanceSummary = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(a => a.status === 'present').length,
    absent: attendanceRecords.filter(a => a.status === 'absent').length,
    late: attendanceRecords.filter(a => a.status === 'late').length,
    percentage: attendanceRecords.length > 0 
      ? Math.round((attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length) * 100)
      : 0,
    recentRecords: attendanceRecords.slice(0, 7)
  };

  // Get result summary
  const results = await Result.find({ studentId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('examId', 'name');

  const resultSummary = results.map(result => ({
    examName: result.examId?.name,
    totalMarks: result.totalMarks,
    obtainedMarks: result.obtainedMarks,
    percentage: result.percentage,
    grade: result.grade,
    status: result.status
  }));

  // Get assignments using enrollment classId/sectionId
  const enrolledClassId = student.currentEnrollment?.classId?._id;
  const enrolledSectionId = student.currentEnrollment?.sectionId?._id;

  const assignments = await Assignment.find({
    ...(enrolledClassId ? { classId: enrolledClassId } : {}),
    ...(enrolledSectionId ? { sectionId: enrolledSectionId } : {}),
    status: 'PUBLISHED',
    isDeleted: { $ne: true }
  }).sort({ dueDate: -1 }).limit(10);

  const assignmentIds = assignments.map(a => a._id.toString());
  const submissions = await AssignmentSubmission.find({
    assignmentId: { $in: assignmentIds },
    studentId
  });

  const assignmentSummary = assignments.map(assignment => {
    const submission = submissions.find(s => 
      s.assignmentId.toString() === assignment._id.toString()
    );
    return {
      _id: assignment._id,
      title: assignment.title,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
      submission: submission ? {
        status: submission.status,
        submittedAt: submission.submittedAt,
        marksObtained: submission.marksObtained,
        isLate: submission.isLate
      } : null
    };
  });

  // Get fee summary
  const studentFees = await StudentFee.find({
    studentId,
    isDeleted: { $ne: true }
  }).populate('academicYearId', 'name year');

  const feeSummary = studentFees.map(fee => ({
    academicYear: fee.academicYearId,
    totalAmount: fee.totalAmount,
    paidAmount: fee.paidAmount,
    balanceAmount: fee.balanceAmount,
    summary: fee.feeSummary
  }));

  res.status(200).json({
    success: true,
    data: {
      profile: {
        _id: student._id,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
        admissionNumber: student.admissionNumber,
        class: student.currentEnrollment?.classId?.name || 'N/A',
        section: student.currentEnrollment?.sectionId?.name || 'N/A',
        classId: student.currentEnrollment?.classId?._id || null,
        sectionId: student.currentEnrollment?.sectionId?._id || null,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        phone: student.phone,
        email: student.email,
        bloodGroup: student.bloodGroup,
        parentName: student.parentName,
        parentPhone: student.parentPhone
      },
      attendance: attendanceSummary,
      results: resultSummary,
      assignments: assignmentSummary,
      fees: feeSummary
    }
  });
});

/**
 * @desc    Get all students linked to parent
 * @route   GET /api/v1/parent/students
 * @access  Private (Parent only)
 */
const getLinkedStudents = asyncHandler(async (req, res) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Parent role required.'
    });
  }

  const students = await ParentStudentMapping.getStudentsForParent(req.user.id);

  const formattedStudents = students.map(student => ({
    _id: student._id,
    name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
    admissionNumber: student.admissionNumber,
    studentPhoto: student.studentPhoto,
    class: student.currentEnrollment?.classId?.name || 'N/A',
    section: student.currentEnrollment?.sectionId?.name || 'N/A'
  }));

  res.status(200).json({
    success: true,
    count: formattedStudents.length,
    data: formattedStudents
  });
});

/**
 * @desc    Get specific child's attendance
 * @route   GET /api/v1/parent/children/:studentId/attendance
 * @access  Private (Parent only - verified parent of student)
 */
const getChildAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;
  const parentId = req.user.id;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(parentId, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student info
  const student = await Student.findById(studentId).select('name admissionNumber');
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Build query for attendance
  const query = { studentId };
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  // Get attendance records
  const attendance = await Attendance.find(query).sort({ date: -1 });

  // Calculate summary
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const total = attendance.length;

  res.status(200).json({
    success: true,
    data: {
      student: { _id: student._id, name: student.name, admissionNumber: student.admissionNumber },
      summary: {
        totalDays: total,
        presentDays: present,
        absentDays: absent,
        lateDays: late,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      },
      records: attendance
    }
  });
});

/**
 * @desc    Get specific child's fees and payment status
 * @route   GET /api/v1/parent/children/:studentId/fees
 * @access  Private (Parent only - verified parent of student)
 */
const getChildFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const parentId = req.user.id;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(parentId, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student info
  const student = await Student.findById(studentId).select('name admissionNumber');
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Get fee details
  const fees = await StudentFee.findOne({ studentId })
    .populate('academicYearId', 'name year');

  res.status(200).json({
    success: true,
    data: {
      student: { _id: student._id, name: student.name, admissionNumber: student.admissionNumber },
      totalFee: fees?.totalAmount || 0,
      paidAmount: fees?.paidAmount || 0,
      dueAmount: fees?.balanceAmount || 0,
      feeHeads: fees?.feeSummary || [] // Mapping feeSummary to feeHeads for frontend
    }
  });
});

/**
 * @desc    Get specific child's exam results
 * @route   GET /api/v1/parent/children/:studentId/results
 * @access  Private (Parent only - verified parent of student)
 */
const getChildResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { examId } = req.query;
  const parentId = req.user.id;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(parentId, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student info
  const student = await Student.findById(studentId).select('name admissionNumber');
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Build query
  const query = { studentId };
  if (examId) query.examId = examId;

  // Get results
  const results = await Result.find(query)
    .populate('examId', 'name examDate')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: results.map(r => ({
      examName: r.examId?.name || 'Unknown Exam',
      examDate: r.examId?.examDate,
      examType: 'Standard', // Placeholder as not explicitly in model
      grade: r.overallGrade || 'N/A',
      obtainedMarks: r.totalMarks || 0,
      totalMarks: r.maxTotalMarks || 0,
      percentage: r.percentage || 0,
      status: r.status?.toUpperCase() || 'PUBLISHED',
      subjects: r.subjects.map(s => ({
        name: s.subjectId?.name || 'Unknown',
        obtainedMarks: s.marksObtained,
        totalMarks: s.maxMarks,
        percentage: s.maxMarks > 0 ? (s.marksObtained / s.maxMarks) * 100 : 0,
        grade: s.grade
      }))
    }))
  });
});

/**
 * @desc    Get specific child's announcements
 * @route   GET /api/v1/parent/children/:studentId/announcements
 * @access  Private (Parent only - verified parent of student)
 */
const getChildAnnouncements = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const parentId = req.user.id;
  const schoolId = req.user.schoolId;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(parentId, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student info with class
  const student = await Student.findById(studentId)
    .select('firstName lastName admissionNumber')
    .populate({
      path: 'currentEnrollment',
      populate: { path: 'classId', select: '_id name' }
    });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  const enrolledClassId = student.currentEnrollment?.classId?._id;

  // Get announcements for school and class
  const announcements = await Announcement.find({
    schoolId,
    status: 'published',
    $or: [
      { targetAudience: 'all' },
      { targetAudience: 'parents' },
      { classId: enrolledClassId }
    ],
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ]
  }).sort({ publishDate: -1 }).limit(20);

  res.status(200).json({
    success: true,
    data: {
      student: { _id: student._id, name: student.name, admissionNumber: student.admissionNumber },
      announcements
    }
  });
});

/**
 * @desc    Get specific child's timetable
 * @route   GET /api/v1/parent/children/:studentId/timetable
 * @access  Private (Parent only - verified parent of student)
 */
const getChildTimetable = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const parentId = req.user.id;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(parentId, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student info with class
  const student = await Student.findById(studentId)
    .select('firstName lastName admissionNumber')
    .populate({
      path: 'currentEnrollment',
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'timetable' }
      ]
    });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  res.status(200).json({
    success: true,
    data: {
      student: { _id: student._id, name: student.name, admissionNumber: student.admissionNumber },
      class: student.currentEnrollment?.classId,
      timetable: student.currentEnrollment?.timetable || []
    }
  });
});

// GET /api/parent/homework/:studentId - Get child's homework
const getChildHomework = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(req.user.id, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student's current enrollment
  const StudentProfile = require('../models/StudentProfile');
  const student = await StudentProfile.findOne({
    _id: studentId,
    schoolId: req.user.schoolId,
  }).populate('currentEnrollment');

  if (!student || !student.currentEnrollment) {
    return next(new ErrorResponse('Student enrollment not found', 404));
  }

  // Build query for assignments
  const Assignment = require('../models/Assignment');
  const query = {
    classId: student.currentEnrollment.classId,
    sectionId: student.currentEnrollment.sectionId,
    schoolId: req.user.schoolId,
    isDeleted: { $ne: true },
    status: 'PUBLISHED'
  };

  // Filter by status if provided
  if (status === 'pending') {
    query.dueDate = { $gte: new Date() };
  } else if (status === 'overdue') {
    query.dueDate = { $lt: new Date() };
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [homework, total] = await Promise.all([
    Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name')
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Assignment.countDocuments(query)
  ]);

  // Get submission status for each homework
  const AssignmentSubmission = require('../models/AssignmentSubmission');
  const homeworkIds = homework.map(h => h._id);
  const submissions = await AssignmentSubmission.find({
    assignmentId: { $in: homeworkIds },
    studentId: studentId,
    isDeleted: { $ne: true }
  });

  // Add submission status to homework
  const homeworkWithStatus = homework.map(hw => {
    const submission = submissions.find(s => s.assignmentId.toString() === hw._id.toString());
    
    // Determine status for frontend
    let status = 'pending';
    if (submission) {
      status = submission.status === 'GRADED' ? 'graded' : 'submitted';
    } else if (new Date(hw.dueDate) < new Date()) {
      status = 'overdue';
    }

    return {
      _id: hw._id,
      title: hw.title,
      description: hw.description,
      subject: hw.subjectId?.name || 'Unknown',
      dueDate: hw.dueDate,
      status: status,
      isSubmitted: !!submission,
      submittedDate: submission?.submittedAt,
      grade: submission?.grade,
      maxMarks: hw.maxMarks,
      obtainedMarks: submission?.marksObtained
    };
  });

  res.status(200).json({
    success: true,
    count: homeworkWithStatus.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: homeworkWithStatus
  });
});

// GET /api/parent/remarks/:studentId - Get child's remarks
const getChildRemarks = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { category, type, page = 1, limit = 20 } = req.query;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(req.user.id, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get current academic year
  const AcademicYear = require('../models/AcademicYear');
  const currentAcademicYear = await AcademicYear.findOne({
    schoolId: req.user.schoolId,
    isActive: true
  });

  if (!currentAcademicYear) {
    return next(new ErrorResponse('No active academic year found', 400));
  }

  // Build query
  const StudentRemark = require('../models/StudentRemark');
  const query = {
    studentId,
    schoolId: req.user.schoolId,
    academicYearId: currentAcademicYear._id,
    isDeleted: { $ne: true }
  };

  if (category) query.category = category;
  if (type) query.type = type;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [remarks, total] = await Promise.all([
    StudentRemark.find(query)
      .populate('teacherId', 'name')
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

// GET /api/parent/performance/:studentId - Get child's performance summary
const getChildPerformance = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  // Verify parent has access to this student
  const hasAccess = await ParentStudentMapping.hasAccess(req.user.id, studentId);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this student.'
    });
  }

  // Get student info
  const StudentProfile = require('../models/StudentProfile');
  const student = await StudentProfile.findOne({
    _id: studentId,
    schoolId: req.user.schoolId,
  }).populate('currentEnrollment');

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Get performance data in parallel
  const [attendanceStats, recentResults, feeStatus, recentRemarks] = await Promise.all([
    // Attendance statistics (last 30 days)
    Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          schoolId: new mongoose.Types.ObjectId(req.user.schoolId),
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    // Recent exam results
    Result.find({
      studentId,
      schoolId: req.user.schoolId
    })
    .populate('examId', 'name examDate')
    .populate('subjectId', 'name')
    .sort({ createdAt: -1 })
    .limit(10),
    // Fee status
    StudentFee.findOne({
      studentId,
      schoolId: req.user.schoolId,
      isActive: true
    }),
    // Recent remarks
    StudentRemark.find({
      studentId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    })
    .populate('teacherId', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
  ]);

  // Calculate attendance percentage
  const totalAttendanceDays = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentDays = attendanceStats.find(stat => stat._id === 'Present')?.count || 0;
  const attendancePercentage = totalAttendanceDays > 0 ? ((presentDays / totalAttendanceDays) * 100).toFixed(1) : 0;

  // Calculate average marks
  const totalMarks = recentResults.reduce((sum, result) => sum + (result.marksObtained || 0), 0);
  const totalMaxMarks = recentResults.reduce((sum, result) => sum + (result.maxMarks || 0), 0);
  const averagePercentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        class: student.currentEnrollment?.classId,
        section: student.currentEnrollment?.sectionId
      },
      performance: {
        attendance: {
          percentage: parseFloat(attendancePercentage),
          breakdown: attendanceStats
        },
        academics: {
          averagePercentage: parseFloat(averagePercentage),
          recentResults: recentResults.slice(0, 5)
        },
        fees: feeStatus ? {
          totalAmount: feeStatus.totalAmount,
          paidAmount: feeStatus.paidAmount,
          balanceAmount: feeStatus.balanceAmount,
          status: feeStatus.balanceAmount > 0 ? 'Pending' : 'Paid'
        } : null,
        behavior: {
          recentRemarks: recentRemarks,
          positiveCount: recentRemarks.filter(r => r.type === 'POSITIVE').length,
          negativeCount: recentRemarks.filter(r => r.type === 'NEGATIVE').length
        }
      }
    }
  });
});

module.exports = {
  getParentDashboard,
  getStudentDetail,
  getLinkedStudents,
  getChildAttendance,
  getChildFees,
  getChildResults,
  getChildAnnouncements,
  getChildTimetable,
  getChildHomework,
  getChildRemarks,
  getChildPerformance
};
