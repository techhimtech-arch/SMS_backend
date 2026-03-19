const asyncHandler = require('express-async-handler');
const ParentStudentMapping = require('../models/ParentStudentMapping');
const Student = require('../models/Student');
const StudentFee = require('../models/StudentFee');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Announcement = require('../models/Announcement');
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

  // Get parent's linked students
  const mapping = await ParentStudentMapping.findByParent(parentId);
  
  if (!mapping || !mapping.studentIds || mapping.studentIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        linkedStudents: [],
        attendanceSummary: null,
        feeDues: null,
        latestResults: [],
        latestAnnouncements: []
      }
    });
  }

  const studentIds = mapping.studentIds.map(s => s._id.toString());
  const currentAcademicYear = req.user.currentAcademicYear;

  // Get attendance summary for all linked students
  const attendanceSummary = await Promise.all(
    studentIds.map(async (studentId) => {
      const attendance = await Attendance.find({
        student: studentId,
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
    isDeleted: { $ne: true },
    'feeItems.status': { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
  }).populate('studentId', 'name admissionNumber');

  const feeSummary = feeDues.map(fee => ({
    studentId: fee.studentId._id,
    studentName: fee.studentId.name,
    totalDue: fee.feeItems
      .filter(item => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(item.status))
      .reduce((sum, item) => sum + item.dueAmount, 0),
    overdueItems: fee.feeItems.filter(item => item.status === 'OVERDUE').length
  }));

  // Get latest results for linked students
  const latestResults = await Result.find({
    studentId: { $in: studentIds },
    schoolId
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('studentId', 'name')
    .populate('examId', 'name');

  // Get latest announcements
  const latestAnnouncements = await Announcement.find({
    schoolId,
    status: 'published',
    $or: [
      { targetAudience: 'all' },
      { targetAudience: 'parents' },
      { targetUsers: { $elemMatch: { userId: parentId } } }
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
      linkedStudents: mapping.studentIds.map(student => ({
        _id: student._id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        class: student.classId,
        section: student.sectionId
      })),
      attendanceSummary,
      feeDues: feeSummary,
      latestResults,
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

  // Get student profile
  const student = await Student.findById(studentId)
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get attendance summary
  const attendanceRecords = await Attendance.find({
    student: studentId
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

  // Get assignments
  const assignments = await Assignment.find({
    classId: student.classId?._id,
    sectionId: student.sectionId?._id,
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
        name: student.name,
        admissionNumber: student.admissionNumber,
        class: student.classId,
        section: student.sectionId,
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

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

module.exports = {
  getParentDashboard,
  getStudentDetail,
  getLinkedStudents
};
