const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Attendance = require('../models/Attendance');
const StudentFee = require('../models/StudentFee');
const FeePayment = require('../models/FeePayment');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Announcement = require('../models/Announcement');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// GET /api/student/profile - Get student profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  // Get student profile
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .populate('parentUserId', 'name email');

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get current enrollment
  const Enrollment = require('../models/Enrollment');
  const currentEnrollment = await Enrollment.findOne({
    studentId: student._id,
    schoolId: req.user.schoolId,
    status: 'ENROLLED'
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get student user info
  const user = await User.findOne({
    _id: req.user.userId,
    schoolId: req.user.schoolId,
  }).select('-password');

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      profile: {
        _id: student._id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        bloodGroup: student.bloodGroup,
        emergencyContact: student.emergencyContact,
        class: currentEnrollment?.classId || null,
        section: currentEnrollment?.sectionId || null,
        rollNumber: currentEnrollment?.rollNumber || null,
        parentUserId: student.parentUserId,
        admissionDate: student.admissionDate,
        isActive: student.isActive,
      },
    },
  });
});

// PUT /api/student/profile - Update student profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    address,
    bloodGroup,
    emergencyContact,
    phone,
  } = req.body;

  // Find and update student profile
  const student = await StudentProfile.findOneAndUpdate(
    {
      userId: req.user.userId,
      schoolId: req.user.schoolId,
    },
    {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(address && { address }),
      ...(bloodGroup && { bloodGroup }),
      ...(emergencyContact && { emergencyContact }),
    },
    { new: true, runValidators: true }
  )
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Update user phone if provided
  if (phone) {
    await User.findOneAndUpdate(
      {
        _id: req.user.userId,
        schoolId: req.user.schoolId,
      },
      { phone },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: student,
  });
});

// GET /api/student/attendance - Get student's attendance records
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, page = 1, limit = 50 } = req.query;

  // Get student profile
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get current enrollment strictly
  const Enrollment = require('../models/Enrollment');
  const currentEnrollment = await Enrollment.findOne({
    studentId: student._id,
    schoolId: req.user.schoolId,
    status: 'ENROLLED'
  });

  // Build query: Checking studentId, or enrollmentId matching student ID (legacy bug), or true enrollment ID
  const query = {
    $or: [
      { studentId: student._id }, 
      { enrollmentId: student._id },
      ...(currentEnrollment ? [{ enrollmentId: currentEnrollment._id }] : [])
    ],
    schoolId: req.user.schoolId,
  };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const attendance = await Attendance.find(query)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(query);

  // Calculate attendance statistics
  const stats = await Attendance.aggregate([
    {
      $match: {
        $or: [
          { studentId: student._id }, 
          { enrollmentId: student._id },
          ...(currentEnrollment ? [{ enrollmentId: currentEnrollment._id }] : [])
        ],
        schoolId: req.user.schoolId,
        ...(startDate && endDate && {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        }),
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const attendanceStats = {
    totalDays: total,
    present: stats.find(s => s._id === 'Present')?.count || 0,
    absent: stats.find(s => s._id === 'Absent')?.count || 0,
    late: stats.find(s => s._id === 'Late')?.count || 0,
    halfDay: stats.find(s => s._id === 'Half Day')?.count || 0,
    leave: stats.find(s => s._id === 'Leave')?.count || 0,
  };

  const percentage = attendanceStats.totalDays > 0 
    ? ((attendanceStats.present / attendanceStats.totalDays) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      attendance,
      statistics: {
        ...attendanceStats,
        percentage: parseFloat(percentage),
      },
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    },
  });
});

// GET /api/student/fees - Get student's fee details
exports.getFees = asyncHandler(async (req, res, next) => {
  // Get student profile
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get current enrollment strictly
  const Enrollment = require('../models/Enrollment');
  const currentEnrollment = await Enrollment.findOne({
    studentId: student._id,
    schoolId: req.user.schoolId,
    status: 'ENROLLED'
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  // Get student fee structure
  const studentFee = await StudentFee.findOne({
    $or: [
      { studentId: student._id },
      ...(currentEnrollment ? [{ enrollmentId: currentEnrollment._id }] : [])
    ],
    schoolId: req.user.schoolId,
  });

  // Get payment history
  const payments = await FeePayment.find({
    $or: [
      { studentId: student._id },
      ...(currentEnrollment ? [{ enrollmentId: currentEnrollment._id }] : [])
    ],
    schoolId: req.user.schoolId,
  })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        class: currentEnrollment?.classId?.name,
        section: currentEnrollment?.sectionId?.name,
      },
      feeStructure: studentFee ? {
        totalAmount: studentFee.totalAmount,
        paidAmount: studentFee.paidAmount,
        balanceAmount: studentFee.balanceAmount,
        dueDate: studentFee.dueDate,
        academicYear: studentFee.academicYear,
      } : null,
      paymentHistory: payments,
    },
  });
});

// GET /api/student/results - Get student's exam results
exports.getResults = asyncHandler(async (req, res, next) => {
  const { examId, subjectId, page = 1, limit = 50 } = req.query;

  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Build query
  const query = {
    studentId: student._id,
    schoolId: req.user.schoolId,
  };

  if (examId) query.examId = examId;
  if (subjectId) query.subjectId = subjectId;

  const results = await Result.find(query)
    .populate('examId', 'name examDate totalMarks')
    .populate('subjectId', 'name')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Result.countDocuments(query);

  // Calculate overall statistics
  const allResults = await Result.find({
    studentId: student._id,
    schoolId: req.user.schoolId,
  });

  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  const subjectStats = {};

  allResults.forEach(result => {
    totalMarksObtained += result.marksObtained || 0;
    totalMaxMarks += result.maxMarks || 0;
    
    const subjectName = result.subjectId?.name || 'Unknown';
    if (!subjectStats[subjectName]) {
      subjectStats[subjectName] = {
        totalObtained: 0,
        totalMax: 0,
        count: 0,
      };
    }
    subjectStats[subjectName].totalObtained += result.marksObtained || 0;
    subjectStats[subjectName].totalMax += result.maxMarks || 0;
    subjectStats[subjectName].count += 1;
  });

  const overallPercentage = totalMaxMarks > 0 
    ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)
    : 0;

  // Calculate grade
  let overallGrade = 'F';
  const percentage = parseFloat(overallPercentage);
  if (percentage >= 90) overallGrade = 'A+';
  else if (percentage >= 80) overallGrade = 'A';
  else if (percentage >= 70) overallGrade = 'B+';
  else if (percentage >= 60) overallGrade = 'B';
  else if (percentage >= 50) overallGrade = 'C';
  else if (percentage >= 40) overallGrade = 'D';

  res.status(200).json({
    success: true,
    data: {
      results,
      statistics: {
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage: parseFloat(overallPercentage),
        overallGrade,
        totalExams: allResults.length,
        subjectWiseStats: Object.entries(subjectStats).map(([subject, stats]) => ({
          subject,
          averagePercentage: stats.totalMax > 0 
            ? ((stats.totalObtained / stats.totalMax) * 100).toFixed(2)
            : 0,
          totalExams: stats.count,
        })),
      },
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    },
  });
});

// GET /api/student/exams - Get upcoming and recent exams
exports.getExams = asyncHandler(async (req, res, next) => {
  const { status = 'upcoming', page = 1, limit = 20 } = req.query;

  // Get student's class and section
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get current enrollment
  const Enrollment = require('../models/Enrollment');
  const currentEnrollment = await Enrollment.findOne({
    studentId: student._id,
    schoolId: req.user.schoolId,
    status: 'ENROLLED'
  });

  if (!currentEnrollment) {
    return next(new ErrorResponse('Student not enrolled in any class', 404));
  }

  // Build query based on status
  const query = {
    schoolId: req.user.schoolId,
    classId: currentEnrollment.classId,
    isActive: true,
  };

  const now = new Date();
  
  if (status === 'upcoming') {
    query.examDate = { $gt: now };
  } else if (status === 'completed') {
    query.examDate = { $lte: now };
  }

  const exams = await Exam.find(query)
    .populate('subjectId', 'name')
    .populate('classId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ examDate: status === 'upcoming' ? 1 : -1 });

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

// GET /api/student/announcements - Get announcements for student
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  // Get student's class and section
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get current enrollment
  const Enrollment = require('../models/Enrollment');
  const currentEnrollment = await Enrollment.findOne({
    studentId: student._id,
    schoolId: req.user.schoolId,
    status: 'ENROLLED'
  });

  const now = new Date();

  // Build query for announcements
  const query = {
    schoolId: req.user.schoolId,
    isActive: true,
    $or: [
      { targetAudience: 'all_students' },
      { targetAudience: 'all' },
      { 
        targetAudience: 'specific_classes',
        targetClasses: { $in: [currentEnrollment?.classId] }
      },
      {
        targetAudience: 'specific_sections',
        targetClasses: { $in: [currentEnrollment?.classId] },
        targetSections: { $in: [currentEnrollment?.sectionId] }
      },
      {
        targetAudience: 'specific_users',
        targetUsers: { $in: [req.user.userId] }
      }
    ],
    $and: [
      {
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gt: now } }
        ]
      },
      {
        $or: [
          { scheduledDate: { $exists: false } },
          { scheduledDate: { $lte: now } }
        ]
      }
    ]
  };

  const announcements = await Announcement.find(query)
    .populate('createdBy', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ isPinned: -1, createdAt: -1 });

  const total = await Announcement.countDocuments(query);

  res.status(200).json({
    success: true,
    data: announcements,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAnnouncements: total,
    },
  });
});

// GET /api/student/dashboard - Get student dashboard stats
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user.userId;
  const schoolId = req.user.schoolId;

  // Get student profile and current enrollment
  const student = await StudentProfile.findOne({
    userId: studentId,
    schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get current enrollment to get class and section
  const Enrollment = require('../models/Enrollment');
  const currentEnrollment = await Enrollment.findOne({
    studentId: student._id,
    schoolId,
    status: 'ENROLLED'
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  // Get stats in parallel
  const [
    attendanceStats,
    todayAttendance,
    overallAttendanceStats,
    feeStats,
    resultStats,
    upcomingExams,
    unreadAnnouncements,
    assignmentStats,
  ] = await Promise.all([
    // Attendance statistics for current month
    Attendance.aggregate([
      {
        $match: {
          $or: [
            { studentId: student._id },
            { enrollmentId: student._id },
            ...(currentEnrollment ? [{ enrollmentId: currentEnrollment._id }] : [])
          ],
          schoolId,
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    // Today's attendance (specific status)
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayRecord = await Attendance.findOne({
        $or: [
          { studentId: student._id },
          { enrollmentId: student._id },
          ...(currentEnrollment ? [{ enrollmentId: currentEnrollment._id }] : [])
        ],
        schoolId,
        date: { $gte: today, $lt: tomorrow }
      });
      
      return {
        status: todayRecord?.status || 'Not Marked',
        date: today,
        remarks: todayRecord?.remarks || null
      };
    })(),
    // Overall attendance statistics (all time)
    Attendance.aggregate([
      {
        $match: {
          $or: [
            { studentId: student._id },
            { enrollmentId: student._id },
            ...(currentEnrollment ? [{ enrollmentId: currentEnrollment._id }] : [])
          ],
          schoolId,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    // Fee information
    StudentFee.findOne({
      studentId: student._id, // Use student._id
      schoolId,
    }),
    // Latest results
    Result.find({
      studentId: student._id, // Use student._id
      schoolId,
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('examId', 'name')
    .populate('subjectId', 'name'),
    // Upcoming exams
    Exam.find({
      schoolId,
      classId: currentEnrollment ? currentEnrollment.classId : null, // Use currentEnrollment.classId
      examDate: { $gt: new Date() },
      isActive: true,
    })
    .sort({ examDate: 1 })
    .limit(3)
    .populate('subjectId', 'name'),
    // Unread announcements count
    Announcement.countDocuments({
      schoolId,
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      $or: [
        { targetAudience: 'all_students' },
        { targetAudience: 'all' },
        ...(currentEnrollment ? [{ 
          targetAudience: 'specific_classes',
          targetClasses: { $in: [currentEnrollment.classId._id || currentEnrollment.classId] }
        }] : []),
      ],
    }),
    // Assignment statistics (pending, completed, overdue)
    (async () => {
      if (!currentEnrollment) {
        return { pending: 0, completed: 0, overdue: 0 };
      }
      
      // Get all assignments for student's class
      const assignments = await Assignment.find({
        classId: currentEnrollment.classId,
        sectionId: currentEnrollment.sectionId,
        schoolId,
        isDeleted: { $ne: true },
        status: 'PUBLISHED'
      });
      
      // Get student's submissions
      const submissions = await AssignmentSubmission.find({
        studentId: student._id,
        isDeleted: { $ne: true }
      });
      
      const submissionMap = new Map(submissions.map(s => [s.assignmentId.toString(), s]));
      
      let pending = 0, completed = 0, overdue = 0;
      const now = new Date();
      
      assignments.forEach(assignment => {
        const isSubmitted = submissionMap.has(assignment._id.toString());
        if (isSubmitted) {
          completed++;
        } else {
          pending++;
          if (assignment.dueDate && assignment.dueDate < now) {
            overdue++;
          }
        }
      });
      
      return { pending, completed, overdue, total: assignments.length };
    })(),
  ]);

  // Calculate attendance statistics for this month
  const attendanceData = {
    totalDays: attendanceStats.reduce((sum, stat) => sum + stat.count, 0),
    present: attendanceStats.find(s => s._id === 'Present')?.count || 0,
    absent: attendanceStats.find(s => s._id === 'Absent')?.count || 0,
    late: attendanceStats.find(s => s._id === 'Late')?.count || 0,
  };

  const attendancePercentage = attendanceData.totalDays > 0 
    ? ((attendanceData.present / attendanceData.totalDays) * 100).toFixed(2)
    : 0;

  // Calculate overall attendance statistics (all time)
  const overallAttendanceData = {
    totalDays: overallAttendanceStats.reduce((sum, stat) => sum + stat.count, 0),
    present: overallAttendanceStats.find(s => s._id === 'Present')?.count || 0,
    absent: overallAttendanceStats.find(s => s._id === 'Absent')?.count || 0,
    late: overallAttendanceStats.find(s => s._id === 'Late')?.count || 0,
  };

  const overallPercentage = overallAttendanceData.totalDays > 0 
    ? ((overallAttendanceData.present / overallAttendanceData.totalDays) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        class: currentEnrollment?.classId?.name || 'Not Enrolled',
        section: currentEnrollment?.sectionId?.name || 'Not Enrolled',
        rollNumber: currentEnrollment?.rollNumber || '-',
        admissionNumber: student.admissionNumber,
        status: currentEnrollment?.status || 'Not Enrolled',
      },
      attendance: {
        today: {
          status: todayAttendance.status,
          date: todayAttendance.date,
          remarks: todayAttendance.remarks,
        },
        thisMonth: {
          totalDays: attendanceData.totalDays,
          present: attendanceData.present,
          absent: attendanceData.absent,
          late: attendanceData.late,
          percentage: parseFloat(attendancePercentage),
        },
        overall: {
          totalDays: overallAttendanceData.totalDays,
          present: overallAttendanceData.present,
          absent: overallAttendanceData.absent,
          late: overallAttendanceData.late,
          percentage: parseFloat(overallPercentage),
        }
      },
      fees: feeStats ? {
        totalAmount: feeStats.totalAmount,
        paidAmount: feeStats.paidAmount,
        balanceAmount: feeStats.balanceAmount,
        dueDate: feeStats.dueDate,
      } : null,
      assignments: {
        pending: assignmentStats.pending || 0,
        completed: assignmentStats.completed || 0,
        overdue: assignmentStats.overdue || 0,
        total: assignmentStats.total || 0,
      },
      recentResults: resultStats,
      upcomingExams,
      unreadAnnouncements,
    },
  });
});

// GET /api/student/homework - Get student homework assignments
exports.getHomework = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  // Get student's current enrollment
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
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
    studentId: student._id,
    isDeleted: { $ne: true }
  });

  // Add submission status to homework
  const homeworkWithStatus = homework.map(hw => {
    const submission = submissions.find(s => s.assignmentId.toString() === hw._id.toString());
    return {
      ...hw.toObject(),
      submission: submission || null,
      isSubmitted: !!submission,
      isOverdue: new Date(hw.dueDate) < new Date() && !submission,
      daysUntilDue: Math.ceil((new Date(hw.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
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

// GET /api/student/homework/:homeworkId - Get single homework with submission
exports.getHomeworkDetails = asyncHandler(async (req, res, next) => {
  const { homeworkId } = req.params;

  // Get student's current enrollment
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  }).populate('currentEnrollment');

  if (!student || !student.currentEnrollment) {
    return next(new ErrorResponse('Student enrollment not found', 404));
  }

  // Get homework details
  const Assignment = require('../models/Assignment');
  const homework = await Assignment.findOne({
    _id: homeworkId,
    classId: student.currentEnrollment.classId,
    sectionId: student.currentEnrollment.sectionId,
    schoolId: req.user.schoolId,
    status: 'PUBLISHED',
    isDeleted: { $ne: true }
  }).populate('subjectId', 'name code')
    .populate('teacherId', 'name email');

  if (!homework) {
    return next(new ErrorResponse('Homework not found', 404));
  }

  // Get student's submission if exists
  const AssignmentSubmission = require('../models/AssignmentSubmission');
  const submission = await AssignmentSubmission.findOne({
    assignmentId: homeworkId,
    studentId: student._id,
    isDeleted: { $ne: true }
  });

  res.status(200).json({
    success: true,
    data: {
      homework,
      submission,
      isSubmitted: !!submission,
      isOverdue: new Date(homework.dueDate) < new Date() && !submission,
      canSubmit: !submission && new Date(homework.dueDate) >= new Date()
    }
  });
});

// POST /api/student/homework/:homeworkId/submit - Submit homework
exports.submitHomework = asyncHandler(async (req, res, next) => {
  const { homeworkId } = req.params;
  const { content, attachments } = req.body;

  // Get student's current enrollment
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  }).populate('currentEnrollment');

  if (!student || !student.currentEnrollment) {
    return next(new ErrorResponse('Student enrollment not found', 404));
  }

  // Get homework details
  const Assignment = require('../models/Assignment');
  const homework = await Assignment.findOne({
    _id: homeworkId,
    classId: student.currentEnrollment.classId,
    sectionId: student.currentEnrollment.sectionId,
    schoolId: req.user.schoolId,
    status: 'PUBLISHED',
    isDeleted: { $ne: true }
  });

  if (!homework) {
    return next(new ErrorResponse('Homework not found', 404));
  }

  // Check if submission already exists
  const AssignmentSubmission = require('../models/AssignmentSubmission');
  const existingSubmission = await AssignmentSubmission.findOne({
    assignmentId: homeworkId,
    studentId: student._id,
    isDeleted: { $ne: true }
  });

  if (existingSubmission) {
    return next(new ErrorResponse('Homework already submitted', 400));
  }

  // Check if homework is overdue
  const now = new Date();
  const dueDate = new Date(homework.dueDate);
  const isLate = now > dueDate;

  // Create submission
  const submission = new AssignmentSubmission({
    assignmentId: homeworkId,
    studentId: student._id,
    content,
    attachments: attachments || [],
    submittedAt: now,
    isLate,
    status: 'SUBMITTED'
  });

  const savedSubmission = await submission.save();

  // Send notification to teacher
  const notificationService = require('../services/notificationService');
  await notificationService.sendNotification({
    userId: homework.teacherId,
    title: 'New Homework Submission',
    message: `${student.firstName} ${student.lastName} submitted homework: ${homework.title}`,
    type: 'HOMEWORK_SUBMISSION',
    data: {
      homeworkId,
      submissionId: savedSubmission._id,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`
    }
  });

  logger.info('Homework submitted', {
    requestId: req.requestId,
    homeworkId,
    studentId: student._id,
    submissionId: savedSubmission._id,
    isLate
  });

  res.status(201).json({
    success: true,
    message: 'Homework submitted successfully',
    data: savedSubmission
  });
});

// GET /api/student/remarks - Get student remarks
exports.getRemarks = asyncHandler(async (req, res, next) => {
  const { category, type, page = 1, limit = 20 } = req.query;

  // Get student profile
  const student = await StudentProfile.findOne({
    userId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
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
    studentId: student._id,
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
