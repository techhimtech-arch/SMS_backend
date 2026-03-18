const asyncHandler = require('express-async-handler');
const ExamService = require('../services/examService');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/response');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @desc    Create a new exam
 * @route    POST /api/v1/exams
 * @access   Private/School Admin
 */
const createExam = asyncHandler(async (req, res) => {
  try {
    const exam = await ExamService.createExam(req.body, req.user.userId, req.user.schoolId);
    return sendSuccess(res, 201, 'Exam created successfully', exam);
  } catch (error) {
    logger.error('Failed to create exam', {
      error: error.message,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Update exam details
 * @route    PUT /api/v1/exams/:id
 * @access   Private/School Admin
 */
const updateExam = asyncHandler(async (req, res) => {
  try {
    const exam = await ExamService.updateExam(req.params.id, req.body, req.user.userId, req.user.schoolId);
    return sendSuccess(res, 200, 'Exam updated successfully', exam);
  } catch (error) {
    logger.error('Failed to update exam', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Delete exam
 * @route    DELETE /api/v1/exams/:id
 * @access   Private/School Admin
 */
const deleteExam = asyncHandler(async (req, res) => {
  try {
    await ExamService.deleteExam(req.params.id, req.user.userId, req.user.schoolId);
    return sendSuccess(res, 200, 'Exam deleted successfully');
  } catch (error) {
    logger.error('Failed to delete exam', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Get exam details
 * @route    GET /api/v1/exams/:id
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const getExamDetails = asyncHandler(async (req, res) => {
  try {
    const examDetails = await ExamService.getExamDetails(req.params.id, req.user.schoolId);
    return sendSuccess(res, 200, 'Exam details retrieved successfully', examDetails);
  } catch (error) {
    logger.error('Failed to get exam details', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    List exams
 * @route    GET /api/v1/exams
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const listExams = asyncHandler(async (req, res) => {
  try {
    const exams = await ExamService.listExams(req.query, req.user.schoolId);
    return sendSuccess(res, 200, 'Exams retrieved successfully', exams);
  } catch (error) {
    logger.error('Failed to list exams', {
      error: error.message,
      userId: req.user.userId,
      query: req.query
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Assign subjects to exam
 * @route    POST /api/v1/exams/:id/papers
 * @access   Private/School Admin
 */
const assignSubjects = asyncHandler(async (req, res) => {
  try {
    const { subjectAssignments } = req.body;
    const papers = await ExamService.assignSubjects(
      req.params.id,
      subjectAssignments,
      req.user.userId,
      req.user.schoolId
    );
    return sendSuccess(res, 201, 'Subjects assigned successfully', papers);
  } catch (error) {
    logger.error('Failed to assign subjects', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Get exam papers
 * @route    GET /api/v1/exams/:id/papers
 * @access   Private/School Admin, Teacher
 */
const getExamPapers = asyncHandler(async (req, res) => {
  try {
    const ExamSubjectPaper = require('../models/ExamSubjectPaper');
    const papers = await ExamSubjectPaper.findByExam(req.params.id, req.user.schoolId);
    return sendSuccess(res, 200, 'Exam papers retrieved successfully', papers);
  } catch (error) {
    logger.error('Failed to get exam papers', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Update subject paper
 * @route    PUT /api/v1/exams/:id/papers/:paperId
 * @access   Private/School Admin
 */
const updateSubjectPaper = asyncHandler(async (req, res) => {
  try {
    const ExamSubjectPaper = require('../models/ExamSubjectPaper');
    const paper = await ExamSubjectPaper.findOne({
      _id: req.params.paperId,
      examId: req.params.id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!paper) {
      return sendError(res, 404, 'Subject paper not found');
    }

    const updatedPaper = await ExamSubjectPaper.findByIdAndUpdate(
      req.params.paperId,
      { ...req.body, updatedBy: req.user.userId },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 200, 'Subject paper updated successfully', updatedPaper);
  } catch (error) {
    logger.error('Failed to update subject paper', {
      error: error.message,
      examId: req.params.id,
      paperId: req.params.paperId,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Remove subject paper
 * @route    DELETE /api/v1/exams/:id/papers/:paperId
 * @access   Private/School Admin
 */
const removeSubjectPaper = asyncHandler(async (req, res) => {
  try {
    const ExamSubjectPaper = require('../models/ExamSubjectPaper');
    const paper = await ExamSubjectPaper.findOne({
      _id: req.params.paperId,
      examId: req.params.id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!paper) {
      return sendError(res, 404, 'Subject paper not found');
    }

    // Check if marks have been entered for this paper
    const MarksEntry = require('../models/MarksEntry');
    const marksExist = await MarksEntry.findOne({
      examSubjectPaperId: req.params.paperId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (marksExist) {
      return sendError(res, 400, 'Cannot remove subject paper as marks have been entered');
    }

    await ExamSubjectPaper.findByIdAndUpdate(req.params.paperId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Subject paper removed successfully');
  } catch (error) {
    logger.error('Failed to remove subject paper', {
      error: error.message,
      examId: req.params.id,
      paperId: req.params.paperId,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Bulk marks entry
 * @route    POST /api/v1/exams/:id/marks
 * @access   Private/Teacher
 */
const bulkMarksEntry = asyncHandler(async (req, res) => {
  try {
    const { marksData } = req.body;
    const result = await ExamService.bulkMarksEntry(
      req.params.id,
      marksData,
      req.user.userId,
      req.user.schoolId
    );
    return sendSuccess(res, 201, 'Marks entry completed', result);
  } catch (error) {
    logger.error('Failed to bulk marks entry', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Get exam marks
 * @route    GET /api/v1/exams/:id/marks
 * @access   Private/School Admin, Teacher
 */
const getExamMarks = asyncHandler(async (req, res) => {
  try {
    const MarksEntry = require('../models/MarksEntry');
    const marks = await MarksEntry.findByExam(req.params.id, req.user.schoolId);
    return sendSuccess(res, 200, 'Exam marks retrieved successfully', marks);
  } catch (error) {
    logger.error('Failed to get exam marks', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Update marks
 * @route    PUT /api/v1/exams/:id/marks/:marksId
 * @access   Private/Teacher
 */
const updateMarks = asyncHandler(async (req, res) => {
  try {
    const MarksEntry = require('../models/MarksEntry');
    const marks = await MarksEntry.findOne({
      _id: req.params.marksId,
      examId: req.params.id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!marks) {
      return sendError(res, 404, 'Marks entry not found');
    }

    // Check if marks are locked
    if (marks.locked) {
      return sendError(res, 400, 'Cannot edit locked marks');
    }

    // Check if user is authorized (teacher can only edit their assigned subjects)
    if (req.user.role === 'teacher' && marks.enteredBy.toString() !== req.user.userId) {
      return sendError(res, 403, 'You can only edit marks entered by you');
    }

    const updatedMarks = await MarksEntry.findByIdAndUpdate(
      req.params.marksId,
      { ...req.body, lastModifiedBy: req.user.userId },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 200, 'Marks updated successfully', updatedMarks);
  } catch (error) {
    logger.error('Failed to update marks', {
      error: error.message,
      examId: req.params.id,
      marksId: req.params.marksId,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Lock marks
 * @route    PUT /api/v1/exams/:id/marks/lock
 * @access   Private/Teacher
 */
const lockMarks = asyncHandler(async (req, res) => {
  try {
    const { subjectId } = req.body;
    await ExamService.toggleMarksLock(
      req.params.id,
      subjectId,
      true,
      req.user.userId,
      req.user.schoolId
    );
    return sendSuccess(res, 200, 'Marks locked successfully');
  } catch (error) {
    logger.error('Failed to lock marks', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Unlock marks
 * @route    PUT /api/v1/exams/:id/marks/unlock
 * @access   Private/School Admin
 */
const unlockMarks = asyncHandler(async (req, res) => {
  try {
    const { subjectId } = req.body;
    await ExamService.toggleMarksLock(
      req.params.id,
      subjectId,
      false,
      req.user.userId,
      req.user.schoolId
    );
    return sendSuccess(res, 200, 'Marks unlocked successfully');
  } catch (error) {
    logger.error('Failed to unlock marks', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Generate exam results
 * @route    POST /api/v1/exams/:id/results
 * @access   Private/School Admin
 */
const generateResults = asyncHandler(async (req, res) => {
  try {
    const results = await ExamService.generateResults(req.params.id, req.user.schoolId);
    return sendSuccess(res, 200, 'Results generated successfully', results);
  } catch (error) {
    logger.error('Failed to generate results', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Get exam results
 * @route    GET /api/v1/exams/:id/results
 * @access   Private/School Admin, Teacher, Student, Parent
 */
const getExamResults = asyncHandler(async (req, res) => {
  try {
    const results = await ExamService.generateResults(req.params.id, req.user.schoolId);
    return sendSuccess(res, 200, 'Exam results retrieved successfully', results);
  } catch (error) {
    logger.error('Failed to get exam results', {
      error: error.message,
      examId: req.params.id,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

/**
 * @desc    Get student result
 * @route    GET /api/v1/exams/:id/student/:studentId
 * @access   Private/Student, Parent
 */
const getStudentResult = asyncHandler(async (req, res) => {
  try {
    // Check authorization - students can only view their own results
    if (req.user.role === 'student' && req.params.studentId !== req.user.userId) {
      return sendError(res, 403, 'You can only view your own results');
    }

    const result = await ExamService.getStudentResult(
      req.params.id,
      req.params.studentId,
      req.user.schoolId
    );
    return sendSuccess(res, 200, 'Student result retrieved successfully', result);
  } catch (error) {
    logger.error('Failed to get student result', {
      error: error.message,
      examId: req.params.id,
      studentId: req.params.studentId,
      userId: req.user.userId
    });
    return sendError(res, error.statusCode || 500, error.message);
  }
});

module.exports = {
  createExam: [
    authorizePermissions([PERMISSIONS.EXAM_CREATE]),
    createExam
  ],
  updateExam: [
    authorizePermissions([PERMISSIONS.EXAM_UPDATE]),
    updateExam
  ],
  deleteExam: [
    authorizePermissions([PERMISSIONS.EXAM_DELETE]),
    deleteExam
  ],
  getExamDetails: [
    authorizePermissions([PERMISSIONS.EXAM_READ]),
    getExamDetails
  ],
  listExams: [
    authorizePermissions([PERMISSIONS.EXAM_READ]),
    listExams
  ],
  assignSubjects: [
    authorizePermissions([PERMISSIONS.EXAM_CREATE]),
    assignSubjects
  ],
  getExamPapers: [
    authorizePermissions([PERMISSIONS.EXAM_READ]),
    getExamPapers
  ],
  updateSubjectPaper: [
    authorizePermissions([PERMISSIONS.EXAM_UPDATE]),
    updateSubjectPaper
  ],
  removeSubjectPaper: [
    authorizePermissions([PERMISSIONS.EXAM_DELETE]),
    removeSubjectPaper
  ],
  bulkMarksEntry: [
    authorizePermissions([PERMISSIONS.EXAM_CREATE]),
    bulkMarksEntry
  ],
  getExamMarks: [
    authorizePermissions([PERMISSIONS.EXAM_READ]),
    getExamMarks
  ],
  updateMarks: [
    authorizePermissions([PERMISSIONS.EXAM_UPDATE]),
    updateMarks
  ],
  lockMarks: [
    authorizePermissions([PERMISSIONS.EXAM_UPDATE]),
    lockMarks
  ],
  unlockMarks: [
    authorizePermissions([PERMISSIONS.EXAM_DELETE]),
    unlockMarks
  ],
  generateResults: [
    authorizePermissions([PERMISSIONS.EXAM_CREATE]),
    generateResults
  ],
  getExamResults: [
    authorizePermissions([PERMISSIONS.EXAM_READ]),
    getExamResults
  ],
  getStudentResult: [
    authorizePermissions([PERMISSIONS.EXAM_READ]),
    getStudentResult
  ]
};
