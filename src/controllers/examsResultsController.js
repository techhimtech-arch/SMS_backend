const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/ErrorResponse');

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

  // Validate student belongs to the same school
  const existingResult = await Result.findOne({
    studentId,
    examId,
    subjectId,
    schoolId: req.user.schoolId,
  });

  if (existingResult) {
    return next(new ErrorResponse('Result already exists for this student, exam, and subject', 400));
  }

  const result = await Result.create({
    studentId,
    examId,
    subjectId,
    schoolId: req.user.schoolId,
    marksObtained,
    maxMarks,
    grade,
    remarks,
  });

  res.status(201).json({ success: true, data: result });
});

// GET /api/results/student/:studentId
exports.getStudentResults = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { examId } = req.query;

  const query = {
    studentId,
    schoolId: req.user.schoolId,
  };

  if (examId) query.examId = examId;

  const results = await Result.find(query)
    .populate('subjectId', 'name')
    .populate('examId', 'name');

  res.status(200).json({ success: true, data: results });
});