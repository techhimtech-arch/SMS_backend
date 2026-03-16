const mongoose = require('mongoose');
const Student = require('../models/Student');
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

    // Get today's date range (start and end of day)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

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
      // Basic Stats - using countDocuments for simple counts
      Student.countDocuments({ schoolId, isActive: true }),
      
      User.countDocuments({ schoolId, role: 'teacher', isActive: true }),
      
      Class.countDocuments({ schoolId, isActive: true }),
      
      Section.countDocuments({ schoolId, isActive: true }),

      // Attendance Stats - using aggregation pipeline
      Attendance.aggregate([
        {
          $match: {
            schoolId,
            date: { $gte: startOfDay, $lte: endOfDay },
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

      // Fees Stats - total collected using aggregation
      FeePayment.aggregate([
        {
          $match: { schoolId },
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

    // Build response
    const dashboardData = {
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

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

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

    // Get today's attendance for teacher's students
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          schoolId: schoolObjectId,
          date: { $gte: startOfDay, $lte: endOfDay },
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

    // Build response
    const dashboardData = {
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

module.exports = {
  getDashboardStats,
  getTeacherDashboardStats,
};
