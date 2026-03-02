const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Student = require('../models/Student');
const TeacherAssignment = require('../models/TeacherAssignment');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// POST /api/exams
exports.createExam = asyncHandler(async (req, res, next) => {
  const { name, classId, academicYear, examDate } = req.body;

  const exam = await Exam.create({
    name,
    classId,
    schoolId: req.user.schoolId,
    academicYear,
    examDate,
  });

  res.status(201).json({ success: true, data: exam });
});

// POST /api/subjects
exports.createSubject = asyncHandler(async (req, res, next) => {
  const { name, classId } = req.body;

  const subject = await Subject.create({
    name,
    classId,
    schoolId: req.user.schoolId,
  });

  res.status(201).json({ success: true, data: subject });
});

// POST /api/results
exports.addResult = asyncHandler(async (req, res, next) => {
  const { studentId, examId, subjectId, marksObtained, maxMarks, grade, remarks } = req.body;
  const { role, id: userId, schoolId } = req.user;

  // Role-based authorization
  if (role === 'superadmin' || role === 'school_admin') {
    // Allow - no assignment check needed
  } else if (role === 'teacher') {
    // Get student's classId and sectionId for assignment verification
    const student = await Student.findById(studentId).select('classId sectionId');
    if (!student) {
      return next(new ErrorResponse('Student not found', 404));
    }

    // Verify teacher assignment
    const assignment = await TeacherAssignment.findOne({
      teacherId: userId,
      classId: student.classId,
      sectionId: student.sectionId,
      subjectId,
      schoolId,
      isActive: true,
    });

    if (!assignment) {
      return next(new ErrorResponse('You are not authorized to add marks for this subject.', 403));
    }
  } else {
    return next(new ErrorResponse('You are not authorized.', 403));
  }

  // Check for duplicate result
  const existingResult = await Result.findOne({
    studentId,
    examId,
    subjectId,
    schoolId,
  });

  if (existingResult) {
    return next(new ErrorResponse('Result already exists for this student, exam, and subject', 400));
  }

  const result = await Result.create({
    studentId,
    examId,
    subjectId,
    schoolId,
    marksObtained,
    maxMarks,
    grade,
    remarks,
    enteredBy: userId,
  });

  res.status(201).json({ success: true, data: result });
});

// GET /api/results/student/:studentId
exports.getStudentResults = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { examId } = req.query;
  const { role, id: userId, schoolId } = req.user;

  // Parent data isolation - verify studentId belongs to parent
  if (role === 'parent') {
    const student = await Student.findOne({
      _id: studentId,
      parentUserId: userId,
      schoolId,
    });

    if (!student) {
      return next(new ErrorResponse('You are not authorized to access this data.', 403));
    }
  }

  const query = {
    studentId,
    schoolId,
  };

  if (examId) query.examId = examId;

  const results = await Result.find(query)
    .populate('subjectId', 'name')
    .populate('examId', 'name');

  res.status(200).json({ success: true, data: results });
});