const mongoose = require('mongoose');
const Student = require('../models/StudentProfile');
const User = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Attendance = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const StudentFee = require('../models/StudentFee');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');
const TeacherAssignment = require('../models/TeacherAssignment');
const Announcement = require('../models/Announcement');
const Enrollment = require('../models/Enrollment');
const AcademicYear = require('../models/AcademicYear');
const logger = require('../utils/logger');

/**
 * @desc    Get dashboard statistics for school admin
 * @route   GET /api/dashboard
 * @access  Private (school_admin)
 * 
 * RECOMMENDED INDEXES:
 * - Student: { schoolId: 1, isActive: 1 }
 * - User: { schoolId: 1, role: 1, isActive: 1 }
 * - Class: { schoolId: 1, isActive: 1 }
 * - Section: { schoolId: 1, isActive: 1 }
 * - Attendance: { schoolId: 1, date: 1, status: 1 }
 * - FeePayment: { schoolId: 1 }
 * - StudentFee: { schoolId: 1 }
 * - Exam: { schoolId: 1, isActive: 1 }
 * - Result: { schoolId: 1 }
 */
const getDashboardStats = async (req, res) => {
  try {
    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);
    
    // Date filtering - support custom date ranges
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      // Custom date range provided
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      
      dateFilter = {
        date: { $gte: start, $lte: end }
      };
    } else {
      // Default to today if no dates provided
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      dateFilter = {
        date: { $gte: startOfDay, $lte: endOfDay }
      };
    }

    // Get current academic year
    const currentAcademicYear = await AcademicYear.findOne({
      schoolId,
      isCurrent: true,
      isActive: true
    });

    const academicYearId = currentAcademicYear?._id || null;

    // Run all queries in parallel for better performance
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSections,
      attendanceStats,
      feesCollected,
      pendingFees,
      totalExams,
      totalResultsEntered,
    ] = await Promise.all([
      // Count distinct students enrolled in current academic year
      academicYearId ? 
        Enrollment.aggregate([
          {
            $match: {
              schoolId,
              academicYearId,
              status: 'ENROLLED',
              isDeleted: { $ne: true }
            }
          },
          {
            $group: {
              _id: '$studentId'
            }
          },
          {
            $count: 'totalStudents'
          }
        ]).then(result => result[0]?.totalStudents || 0)
        : Promise.resolve(0),
      
      User.countDocuments({ schoolId, role: 'teacher', isActive: true }),
      
      Class.countDocuments({ schoolId, isActive: true }),
      
      Section.countDocuments({ schoolId, isActive: true }),

      // Attendance Stats - using aggregation pipeline with date filter
      Attendance.aggregate([
        {
          $match: {
            schoolId,
            ...dateFilter
          },
        },
        {
          $group: {
            _id: null,
            totalMarked: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
            },
            absentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
            },
          },
        },
      ]),

      // Fees Stats - total collected with date filter if provided
      FeePayment.aggregate([
        {
          $match: { 
            schoolId,
            ...(startDate && endDate && { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } })
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),

      // Pending Fees - sum of balanceAmount from StudentFee
      StudentFee.aggregate([
        {
          $match: { schoolId },
        },
        {
          $group: {
            _id: null,
            totalPending: { $sum: '$balanceAmount' },
          },
        },
      ]),

      // Exam Stats
      Exam.countDocuments({ schoolId, isActive: true }),
      
      Result.countDocuments({ schoolId }),
    ]);

    // Process attendance stats
    const attendanceData = attendanceStats[0] || {
      totalMarked: 0,
      presentCount: 0,
      absentCount: 0,
    };

    // Calculate attendance percentage
    const attendancePercentage =
      attendanceData.totalMarked > 0
        ? parseFloat(((attendanceData.presentCount / attendanceData.totalMarked) * 100).toFixed(2))
        : 0;

    // Process fees stats
    const totalFeesCollected = feesCollected[0]?.totalAmount || 0;
    const totalPendingFees = pendingFees[0]?.totalPending || 0;

    // Build response with date info
    const dashboardData = {
      dateRange: {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        isCustomRange: !!(startDate && endDate)
      },
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSections,
      },
      attendance: {
        totalMarked: attendanceData.totalMarked,
        presentCount: attendanceData.presentCount,
        absentCount: attendanceData.absentCount,
        attendancePercentage,
      },
      fees: {
        totalFeesCollected,
        totalPendingFees,
      },
      exams: {
        totalExams,
        totalResultsEntered,
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error('Dashboard Error', { requestId: req.requestId, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

/**
 * @desc    Get dashboard statistics for teacher
 * @route   GET /api/dashboard/teacher
 * @access  Private (teacher)
 */
const getTeacherDashboardStats = async (req, res) => {
  try {
    const { userId: teacherId, schoolId } = req.user;
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

    // Date filtering - support custom date ranges
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      // Custom date range provided
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      
      dateFilter = {
        date: { $gte: start, $lte: end }
      };
    } else {
      // Default to today if no dates provided
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      dateFilter = {
        date: { $gte: startOfDay, $lte: endOfDay }
      };
    }

    // Get teacher's class assignments (as class teacher)
    const classTeacherAssignments = await ClassTeacherAssignment.find({
      teacherId: teacherObjectId,
      schoolId: schoolObjectId,
      isActive: true
    }).populate('classId', 'name')
      .populate('sectionId', 'name');

    // Get teacher's subject assignments
    const subjectAssignments = await TeacherAssignment.find({
      teacherId: teacherObjectId,
      schoolId: schoolObjectId,
      isActive: true
    }).populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name');

    // Get unique class/section combinations for teacher
    const teacherClasses = [];
    const classSectionMap = new Map();

    // Add class teacher assignments
    classTeacherAssignments.forEach(assignment => {
      const key = `${assignment.classId._id}-${assignment.sectionId._id}`;
      if (!classSectionMap.has(key)) {
        classSectionMap.set(key, {
          classId: assignment.classId,
          sectionId: assignment.sectionId,
          isClassTeacher: true
        });
        teacherClasses.push({
          classId: assignment.classId,
          sectionId: assignment.sectionId,
          isClassTeacher: true
        });
      }
    });

    // Add subject assignments
    subjectAssignments.forEach(assignment => {
      const key = `${assignment.classId._id}-${assignment.sectionId._id}`;
      if (!classSectionMap.has(key)) {
        classSectionMap.set(key, {
          classId: assignment.classId,
          sectionId: assignment.sectionId,
          isClassTeacher: false
        });
        teacherClasses.push({
          classId: assignment.classId,
          sectionId: assignment.sectionId,
          isClassTeacher: false
        });
      } else {
        // Update existing to mark as class teacher if applicable
        const existing = classSectionMap.get(key);
        if (existing.isClassTeacher) {
          const found = teacherClasses.find(c => 
            c.classId._id.toString() === assignment.classId._id.toString() && 
            c.sectionId._id.toString() === assignment.sectionId._id.toString()
          );
          if (found) found.isClassTeacher = true;
        }
      }
    });

    // Get students in teacher's classes
    const studentIds = await Student.find({
      schoolId: schoolObjectId,
      isActive: true,
      $or: teacherClasses.map(tc => ({
        classId: tc.classId._id,
        sectionId: tc.sectionId._id
      }))
    }).distinct('_id');

    // Get today's attendance for teacher's students with date filter
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          schoolId: schoolObjectId,
          ...dateFilter,
          studentId: { $in: studentIds }
        },
      },
      {
        $group: {
          _id: null,
          totalMarked: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
        },
      },
    ]);

    // Get total students assigned to teacher
    const totalAssignedStudents = studentIds.length;

    // Process attendance stats
    const attendanceData = attendanceStats[0] || {
      totalMarked: 0,
      presentCount: 0,
      absentCount: 0,
    };

    // Calculate attendance percentage
    const attendancePercentage =
      attendanceData.totalMarked > 0
        ? parseFloat(((attendanceData.presentCount / attendanceData.totalMarked) * 100).toFixed(2))
        : 0;

    // Build response with date info
    const dashboardData = {
      dateRange: {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        isCustomRange: !!(startDate && endDate)
      },
      stats: {
        totalAssignedStudents,
        totalClasses: teacherClasses.length,
        classTeacherAssignments: classTeacherAssignments.length,
        subjectAssignments: subjectAssignments.length,
      },
      attendance: {
        totalMarked: attendanceData.totalMarked,
        presentCount: attendanceData.presentCount,
        absentCount: attendanceData.absentCount,
        attendancePercentage,
      },
      classes: teacherClasses.map(tc => ({
        class: tc.classId,
        section: tc.sectionId,
        isClassTeacher: tc.isClassTeacher
      })),
      subjects: subjectAssignments.map(sa => ({
        class: sa.classId,
        section: sa.sectionId,
        subject: sa.subjectId
      }))
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error('Teacher Dashboard Error', { requestId: req.requestId, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher dashboard data',
      error: error.message,
    });
  }
};

// Get recent activities for admin dashboard
const getRecentActivities = async (req, res) => {
  try {
    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent student registrations
    const recentStudents = await Student.find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt')
      .populate({
        path: 'currentEnrollment',
        populate: { path: 'classId', select: 'name' }
      });
    
    // Get recent fee payments
    const recentPayments = await FeePayment.find({ schoolId })
      .sort({ paymentDate: -1 })
      .limit(5)
      .select('amount paymentDate status studentId')
      .populate('studentId', 'firstName lastName');
    
    // Get recent exam results
    const recentResults = await Result.find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('marksObtained maxMarks grade examId studentId createdAt')
      .populate('examId', 'name')
      .populate('studentId', 'firstName lastName');
    
    // Get recent announcements
    const recentAnnouncements = await Announcement.find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title message createdAt status');
    
    const activities = [
      ...recentStudents.map(student => ({
        type: 'student_registration',
        title: 'New Student Registered',
        description: `${student.firstName} ${student.lastName} registered in ${student.currentEnrollment?.classId?.name || 'Unknown Class'}`,
        timestamp: student.createdAt,
        data: student
      })),
      ...recentPayments.map(payment => {
        const studentName = payment.studentId ? `${payment.studentId.firstName} ${payment.studentId.lastName}` : 'Unknown';
        return {
          type: 'fee_payment',
          title: 'Fee Payment Received',
          description: `${studentName} paid Rs. ${payment.amount}`,
          timestamp: payment.paymentDate,
          data: payment
        };
      }),
      ...recentResults.map(result => {
        const studentName = result.studentId ? `${result.studentId.firstName} ${result.studentId.lastName}` : 'Unknown';
        return {
          type: 'exam_result',
          title: 'Exam Result Added',
          description: `${studentName} scored ${result.marksObtained}/${result.maxMarks} in ${result.examId?.name || 'Unknown Exam'}`,
          timestamp: result.createdAt,
          data: result
        };
      }),
      ...recentAnnouncements.map(announcement => ({
        type: 'announcement',
        title: announcement.title,
        description: announcement.message.substring(0, 100) + '...',
        timestamp: announcement.createdAt,
        data: announcement
      }))
    ];
    
    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.status(200).json({
      success: true,
      data: activities.slice(0, limit),
    });
  } catch (error) {
    logger.error('Recent Activities Error', { requestId: req.requestId, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message,
    });
  }
};

// Get attendance analytics for admin dashboard
const getAttendanceAnalytics = async (req, res) => {
  try {
    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);
    const { months = 6 } = req.query;
    
    // Calculate date range for last N months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    // Get monthly attendance data
    const monthlyData = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalStudents: { $sum: 1 },
          presentStudents: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absentStudents: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month'
                }
              }
            }
          },
          totalStudents: 1,
          presentStudents: 1,
          absentStudents: 1,
          attendancePercentage: {
            $multiply: [
              {
                $divide: ['$presentStudents', '$totalStudents']
              },
              100
            ]
          }
        }
      },
      { $sort: { month: 1 } }
    ]);
    
    // Get class-wise attendance trends
    const classWiseData = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      { $unwind: '$class' },
      {
        $group: {
          _id: '$class._id',
          className: { $first: '$class.name' },
          totalAttendance: { $sum: 1 },
          presentAttendance: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          className: 1,
          attendancePercentage: {
            $multiply: [
              {
                $divide: ['$presentAttendance', '$totalAttendance']
              },
              100
            ]
          }
        }
      },
      { $sort: { attendancePercentage: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        monthlyTrends: monthlyData,
        classWiseTrends: classWiseData,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          months: parseInt(months)
        }
      }
    });
  } catch (error) {
    logger.error('Attendance Analytics Error', { requestId: req.requestId, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance analytics',
      error: error.message,
    });
  }
};

// Get fee analytics for admin dashboard
const getFeeAnalytics = async (req, res) => {
  try {
    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);
    const { months = 6 } = req.query;
    
    // Calculate date range for last N months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    // Get monthly fee collection trends
    const monthlyData = await FeePayment.aggregate([
      {
        $match: {
          schoolId,
          paymentDate: { $gte: startDate, $lte: endDate },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          totalCollected: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month'
                }
              }
            }
          },
          totalCollected: 1,
          paymentCount: 1
        }
      },
      { $sort: { month: 1 } }
    ]);
    
    // Get pending fees by class
    const pendingFeesByClass = await StudentFee.aggregate([
      {
        $match: {
          schoolId,
          dueAmount: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'student.classId',
          foreignField: '_id',
          as: 'class'
        }
      },
      { $unwind: '$student' },
      { $unwind: '$class' },
      {
        $group: {
          _id: '$class._id',
          className: { $first: '$class.name' },
          totalPending: { $sum: '$dueAmount' },
          studentCount: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          className: 1,
          totalPending: 1,
          studentCount: { $size: '$studentCount' }
        }
      },
      { $sort: { totalPending: -1 } }
    ]);
    
    // Get payment method breakdown
    const paymentMethods = await FeePayment.aggregate([
      {
        $match: {
          schoolId,
          paymentDate: { $gte: startDate, $lte: endDate },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          paymentMethod: '$_id',
          totalAmount: 1,
          count: 1,
          percentage: {
            $multiply: [
              {
                $divide: ['$count', {
                  $sum: '$count'
                }]
              },
              100
            ]
          }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        monthlyTrends: monthlyData,
        pendingFeesByClass,
        paymentMethods,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          months: parseInt(months)
        }
      }
    });
  } catch (error) {
    logger.error('Fee Analytics Error', { requestId: req.requestId, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getTeacherDashboardStats,
  getRecentActivities,
  getAttendanceAnalytics,
  getFeeAnalytics,
};
