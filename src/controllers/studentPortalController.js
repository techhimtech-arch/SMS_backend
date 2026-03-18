const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Attendance = require('../models/Attendance');
const StudentFee = require('../models/StudentFee');
const FeePayment = require('../models/FeePayment');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Announcement = require('../models/Announcement');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// GET /api/student/profile - Get student profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  // Get student profile
  const student = await StudentProfile.findOne({
    _id: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('parentUserId', 'name email');

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
        classId: student.classId,
        sectionId: student.sectionId,
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
      _id: req.user.userId,
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

  // Build query
  const query = {
    studentId: req.user.userId,
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
        studentId: req.user.userId,
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
  // Get student fee structure
  const studentFee = await StudentFee.findOne({
    studentId: req.user.userId,
    schoolId: req.user.schoolId,
  });

  // Get payment history
  const payments = await FeePayment.find({
    studentId: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .sort({ createdAt: -1 });

  // Get student info
  const student = await StudentProfile.findOne({
    _id: req.user.userId,
    schoolId: req.user.schoolId,
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        class: student.classId?.name,
        section: student.sectionId?.name,
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

  // Build query
  const query = {
    studentId: req.user.userId,
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
    studentId: req.user.userId,
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
    _id: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Build query based on status
  const query = {
    schoolId: req.user.schoolId,
    classId: student.classId,
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
    _id: req.user.userId,
    schoolId: req.user.schoolId,
  });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

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
        targetClasses: { $in: [student.classId] }
      },
      {
        targetAudience: 'specific_sections',
        targetClasses: { $in: [student.classId] },
        targetSections: { $in: [student.sectionId] }
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

  // Get student profile
  const student = await StudentProfile.findOne({
    _id: studentId,
    schoolId,
  })
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  // Get stats in parallel
  const [
    attendanceStats,
    feeStats,
    resultStats,
    upcomingExams,
    unreadAnnouncements,
  ] = await Promise.all([
    // Attendance statistics for current month
    Attendance.aggregate([
      {
        $match: {
          studentId,
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
    // Fee information
    StudentFee.findOne({
      studentId,
      schoolId,
    }),
    // Latest results
    Result.find({
      studentId,
      schoolId,
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('examId', 'name')
    .populate('subjectId', 'name'),
    // Upcoming exams
    Exam.find({
      schoolId,
      classId: student.classId,
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
        { 
          targetAudience: 'specific_classes',
          targetClasses: { $in: [student.classId] }
        },
      ],
    }),
  ]);

  // Calculate attendance percentage
  const attendanceData = {
    totalDays: attendanceStats.reduce((sum, stat) => sum + stat.count, 0),
    present: attendanceStats.find(s => s._id === 'Present')?.count || 0,
    absent: attendanceStats.find(s => s._id === 'Absent')?.count || 0,
    late: attendanceStats.find(s => s._id === 'Late')?.count || 0,
  };

  const attendancePercentage = attendanceData.totalDays > 0 
    ? ((attendanceData.present / attendanceData.totalDays) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        class: student.classId?.name,
        section: student.sectionId?.name,
        admissionNumber: student.admissionNumber,
      },
      attendance: {
        ...attendanceData,
        percentage: parseFloat(attendancePercentage),
      },
      fees: feeStats ? {
        totalAmount: feeStats.totalAmount,
        paidAmount: feeStats.paidAmount,
        balanceAmount: feeStats.balanceAmount,
        dueDate: feeStats.dueDate,
      } : null,
      recentResults: resultStats,
      upcomingExams,
      unreadAnnouncements,
    },
  });
});
