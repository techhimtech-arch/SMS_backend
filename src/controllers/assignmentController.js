const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

/**
 * @desc    Create new assignment
 * @route   POST /api/v1/assignments
 * @access  Private (Teacher, Admin)
 */
const createAssignment = asyncHandler(async (req, res) => {
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

  // Validate teacher permission
  if (req.user.role === 'teacher') {
    // Teachers can only create assignments for their assigned subjects/classes
    const hasPermission = await checkTeacherPermission(req.user.id, subjectId, classId, sectionId);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create assignments for this class/section'
      });
    }
  }

  const assignment = new Assignment({
    title,
    description,
    subjectId,
    classId,
    sectionId,
    teacherId: req.user.id,
    dueDate: new Date(dueDate),
    maxMarks,
    attachments: attachments || [],
    allowLateSubmission: allowLateSubmission || false,
    lateSubmissionPenalty: lateSubmissionPenalty || 0,
    createdBy: req.user.id,
    status: 'DRAFT'
  });

  const savedAssignment = await assignment.save();

  // Log audit
  await auditLogger.log({
    action: 'ASSIGNMENT_CREATE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: savedAssignment._id,
    targetType: 'Assignment',
    details: { title, subjectId, classId, dueDate },
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: savedAssignment
  });
});

/**
 * @desc    Get all assignments with filtering
 * @route   GET /api/v1/assignments
 * @access  Private
 */
const getAssignments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    subjectId,
    classId,
    sectionId,
    teacherId,
    sortBy = 'dueDate',
    sortOrder = 'asc'
  } = req.query;

  const query = { isDeleted: { $ne: true } };

  // Apply filters based on user role
  if (req.user.role === 'teacher') {
    query.teacherId = req.user.id;
  } else if (req.user.role === 'student') {
    const user = await User.findById(req.user.id);
    query.classId = user.classId;
    query.sectionId = user.sectionId;
    query.status = 'PUBLISHED';
  } else if (req.user.role === 'parent') {
    // Parents can see assignments of their children
    const user = await User.findById(req.user.id).populate('children');
    if (user.children && user.children.length > 0) {
      query.classId = { $in: user.children.map(c => c.classId) };
      query.sectionId = { $in: user.children.map(c => c.sectionId) };
      query.status = 'PUBLISHED';
    }
  }

  // Apply query filters
  if (status) query.status = status;
  if (subjectId) query.subjectId = subjectId;
  if (classId && req.user.role !== 'student') query.classId = classId;
  if (sectionId && req.user.role !== 'student') query.sectionId = sectionId;
  if (teacherId && ['admin', 'principal'].includes(req.user.role)) query.teacherId = teacherId;

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [assignments, total] = await Promise.all([
    Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('teacherId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Assignment.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: assignments.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: assignments
  });
});

/**
 * @desc    Get single assignment by ID
 * @route   GET /api/v1/assignments/:id
 * @access  Private
 */
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('subjectId', 'name code')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('teacherId', 'name email');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check access permissions
  const hasAccess = await checkAssignmentAccess(assignment, req.user);
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this assignment'
    });
  }

  // Get submission info for students
  let submission = null;
  if (req.user.role === 'student') {
    submission = await AssignmentSubmission.findOne({
      assignmentId: assignment._id,
      studentId: req.user.id,
      isDeleted: { $ne: true }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      assignment,
      submission
    }
  });
});

/**
 * @desc    Update assignment
 * @route   PUT /api/v1/assignments/:id
 * @access  Private (Teacher who created it, Admin)
 */
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check update permission
  if (assignment.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assignment'
    });
  }

  // Don't allow updates if already closed
  if (assignment.status === 'CLOSED' && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update closed assignment'
    });
  }

  const updates = req.body;
  updates.updatedBy = req.user.id;

  const updatedAssignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  // Log audit
  await auditLogger.log({
    action: 'ASSIGNMENT_UPDATE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: assignment._id,
    targetType: 'Assignment',
    details: { updates },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: updatedAssignment
  });
});

/**
 * @desc    Delete assignment (soft delete)
 * @route   DELETE /api/v1/assignments/:id
 * @access  Private (Teacher who created it, Admin)
 */
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check delete permission
  if (assignment.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this assignment'
    });
  }

  await assignment.softDelete(req.user.id);

  // Log audit
  await auditLogger.log({
    action: 'ASSIGNMENT_DELETE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: assignment._id,
    targetType: 'Assignment',
    details: { title: assignment.title },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

/**
 * @desc    Publish assignment
 * @route   POST /api/v1/assignments/:id/publish
 * @access  Private (Teacher who created it, Admin)
 */
const publishAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check permission
  if (assignment.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to publish this assignment'
    });
  }

  await assignment.publish();

  // Create notifications for students
  await notificationService.createAssignmentNotifications(assignment);

  // Log audit
  await auditLogger.log({
    action: 'ASSIGNMENT_PUBLISH',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: assignment._id,
    targetType: 'Assignment',
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Assignment published successfully',
    data: assignment
  });
});

/**
 * @desc    Close assignment
 * @route   POST /api/v1/assignments/:id/close
 * @access  Private (Teacher who created it, Admin)
 */
const closeAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check permission
  if (assignment.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to close this assignment'
    });
  }

  await assignment.close();

  // Log audit
  await auditLogger.log({
    action: 'ASSIGNMENT_CLOSE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: assignment._id,
    targetType: 'Assignment',
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Assignment closed successfully',
    data: assignment
  });
});

/**
 * @desc    Submit assignment
 * @route   POST /api/v1/assignments/:id/submit
 * @access  Private (Student)
 */
const submitAssignment = asyncHandler(async (req, res) => {
  const { submissionText, attachment, lateSubmissionReason } = req.body;

  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if assignment is published
  if (assignment.status !== 'PUBLISHED') {
    return res.status(400).json({
      success: false,
      message: 'Assignment is not available for submission'
    });
  }

  // Check if student has already submitted
  const existingSubmission = await AssignmentSubmission.findOne({
    assignmentId: req.params.id,
    studentId: req.user.id,
    isDeleted: { $ne: true }
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this assignment'
    });
  }

  // Check if assignment is overdue and late submission is not allowed
  const now = new Date();
  const isLate = now > assignment.dueDate;

  if (isLate && !assignment.allowLateSubmission) {
    return res.status(400).json({
      success: false,
      message: 'Assignment submission deadline has passed'
    });
  }

  const submission = new AssignmentSubmission({
    assignmentId: req.params.id,
    studentId: req.user.id,
    submissionText,
    attachment,
    lateSubmissionReason: isLate ? lateSubmissionReason : undefined,
    isLate,
    status: isLate ? 'LATE' : 'SUBMITTED',
    createdBy: req.user.id
  });

  const savedSubmission = await submission.save();

  // Log audit
  await auditLogger.log({
    action: 'ASSIGNMENT_SUBMIT',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: assignment._id,
    targetType: 'Assignment',
    details: { submissionId: savedSubmission._id, isLate },
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: isLate ? 'Assignment submitted late' : 'Assignment submitted successfully',
    data: savedSubmission
  });
});

/**
 * @desc    Get all submissions for an assignment
 * @route   GET /api/v1/assignments/:id/submissions
 * @access  Private (Teacher who created it, Admin)
 */
const getSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check permission
  if (assignment.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view submissions for this assignment'
    });
  }

  const { status, page = 1, limit = 20 } = req.query;

  const filters = {};
  if (status) filters.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [submissions, total] = await Promise.all([
    AssignmentSubmission.findByAssignment(req.params.id, filters)
      .skip(skip)
      .limit(limitNum),
    AssignmentSubmission.countDocuments({ assignmentId: req.params.id, isDeleted: { $ne: true }, ...filters })
  ]);

  res.status(200).json({
    success: true,
    count: submissions.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: submissions
  });
});

/**
 * @desc    Grade a submission
 * @route   POST /api/v1/assignments/:id/grade
 * @access  Private (Teacher who created it, Admin)
 */
const gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId, marksObtained, remarks } = req.body;

  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check permission
  if (assignment.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to grade this assignment'
    });
  }

  // Validate marks
  if (marksObtained < 0 || marksObtained > assignment.maxMarks) {
    return res.status(400).json({
      success: false,
      message: `Marks must be between 0 and ${assignment.maxMarks}`
    });
  }

  const submission = await AssignmentSubmission.findById(submissionId);

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  if (submission.assignmentId.toString() !== req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Submission does not belong to this assignment'
    });
  }

  await submission.grade(marksObtained, remarks, req.user.id);

  // Get student info and create notification
  const student = await User.findById(submission.studentId);
  if (student) {
    await notificationService.createGradingNotification(submission, assignment, student);
  }

  // Log audit
  await auditLogger.log({
    action: 'ASSIGNMENT_GRADE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: submission._id,
    targetType: 'AssignmentSubmission',
    details: { marksObtained, remarks },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    data: submission
  });
});

/**
 * Helper function to check if teacher has permission for subject/class/section
 */
const checkTeacherPermission = async (teacherId, subjectId, classId, sectionId) => {
  const TeacherSubjectAssignment = require('../models/TeacherSubjectAssignment');

  const assignment = await TeacherSubjectAssignment.findOne({
    teacherId,
    subjectId,
    classId,
    sectionId,
    isActive: true
  });

  return !!assignment;
};

/**
 * Helper function to check if user has access to assignment
 */
const checkAssignmentAccess = async (assignment, user) => {
  // Admin has full access
  if (user.role === 'admin') return true;

  // Teacher who created it has access
  if (user.role === 'teacher' && assignment.teacherId.toString() === user._id.toString()) {
    return true;
  }

  // Students in the same class/section can access published assignments
  if (user.role === 'student') {
    const userData = await User.findById(user._id);
    return (
      assignment.status === 'PUBLISHED' &&
      assignment.classId.toString() === userData.classId?.toString() &&
      assignment.sectionId.toString() === userData.sectionId?.toString()
    );
  }

  // Parents can access their children's assignments
  if (user.role === 'parent') {
    const userData = await User.findById(user._id).populate('children');
    if (userData.children && userData.children.length > 0) {
      return userData.children.some(child =>
        assignment.status === 'PUBLISHED' &&
        assignment.classId.toString() === child.classId?.toString() &&
        assignment.sectionId.toString() === child.sectionId?.toString()
      );
    }
  }

  return false;
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  closeAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission
};
