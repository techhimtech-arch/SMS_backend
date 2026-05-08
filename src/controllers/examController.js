const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Exam = require('../models/Exam');
const Mark = require('../models/MarksEntry');
const Enrollment = require('../models/Enrollment');
const Class = require('../models/Class');
const Section = require('../models/Section');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

const normalizeExamTargets = ({ class_id, sections, targets }) => {
  if (Array.isArray(targets) && targets.length > 0) {
    return targets.map(target => ({
      class_id: target.class_id,
      sections: Array.isArray(target.sections) ? target.sections : []
    }));
  }

  return [{
    class_id,
    sections: Array.isArray(sections) ? sections : []
  }];
};

const buildTargetKey = (target) => `${target.class_id}:${[...target.sections].map(String).sort().join(',')}`;

/**
 * @desc    Create new exam(s)
 * @route   POST /api/v1/exams
 * @access  Private/School Admin
 */
const createExam = asyncHandler(async (req, res) => {
  try {
    const { name, class_id, exam_type, sections, subjects, targets } = req.body;
    const schoolId = req.user.schoolId;

    const examTargets = normalizeExamTargets({ class_id, sections, targets });

    if (!name || !exam_type) {
      return sendError(res, 400, 'Exam name and exam type are required');
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return sendError(res, 400, 'At least one subject is required');
    }

    if (examTargets.some(target => !target.class_id || target.sections.length === 0)) {
      return sendError(res, 400, 'Each exam target must include a class_id and at least one section');
    }

    const seenTargets = new Set();
    const seenClasses = new Set();
    for (const target of examTargets) {
      const targetKey = buildTargetKey(target);
      if (seenTargets.has(targetKey)) {
        return sendError(res, 400, 'Duplicate class and section combination found in the request');
      }
      seenTargets.add(targetKey);

      const classKey = String(target.class_id);
      if (seenClasses.has(classKey)) {
        return sendError(res, 400, 'Each class can only appear once in a bulk exam request');
      }
      seenClasses.add(classKey);
    }

    const classIds = [...new Set(examTargets.map(target => String(target.class_id)))];
    const sectionIds = [...new Set(examTargets.flatMap(target => target.sections.map(String)))];

    const classes = await Class.find({
      _id: { $in: classIds },
      schoolId,
      isDeleted: { $ne: true }
    }).select('_id');

    if (classes.length !== classIds.length) {
      return sendError(res, 400, 'One or more class IDs are invalid');
    }

    const sectionsFound = await Section.find({
      _id: { $in: sectionIds },
      schoolId,
      isDeleted: { $ne: true }
    }).select('_id classId');

    const sectionsById = new Map(sectionsFound.map(section => [String(section._id), String(section.classId)]));

    for (const target of examTargets) {
      for (const sectionId of target.sections) {
        const sectionClassId = sectionsById.get(String(sectionId));
        if (!sectionClassId || sectionClassId !== String(target.class_id)) {
          return sendError(res, 400, 'Each section must belong to the selected class');
        }
      }
    }

    const existingExams = await Exam.find({
      name,
      class_id: { $in: classIds },
      schoolId
    }).select('_id class_id');

    const existingClassIds = new Set(existingExams.map(exam => String(exam.class_id)));
    if (existingClassIds.size > 0) {
      return sendError(res, 400, 'An exam with the same name already exists for one or more selected classes');
    }

    const examDocuments = examTargets.map(target => ({
      name,
      class_id: target.class_id,
      exam_type,
      sections: target.sections,
      subjects,
      schoolId
    }));

    const createdExams = await Exam.create(examDocuments);

    return sendSuccess(
      res,
      201,
      createdExams.length > 1 ? 'Exams created successfully' : 'Exam created successfully',
      createdExams.length === 1 ? createdExams[0] : createdExams
    );
  } catch (error) {
    logger.error('Failed to create exam', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

/**
 * @desc    Get exam students
 * @route   GET /api/v1/exams/:id/students
 * @access  Private
 */
const getExamStudents = asyncHandler(async (req, res) => {
  try {
    const examId = req.params.id;
    const schoolId = req.user.schoolId;

    const exam = await Exam.findOne({ _id: examId, schoolId });
    if (!exam) {
      return sendError(res, 404, 'Exam not found');
    }

    const students = await Enrollment.find({
      classId: exam.class_id,
      sectionId: { $in: exam.sections },
      schoolId,
      status: 'ENROLLED',
      isDeleted: { $ne: true }
    }).populate('studentId', 'firstName lastName');

    const formattedStudents = students.map(enr => ({
      enrollment_id: enr._id,
      student_id: enr.studentId?._id,
      student_name: enr.studentId ? `${enr.studentId.firstName} ${enr.studentId.lastName}`.trim() : 'Unknown Student'
    }));

    return sendSuccess(res, 200, 'Students retrieved successfully', formattedStudents);
  } catch (error) {
    logger.error('Failed to fetch exam students', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

/**
 * @desc    Bulk marks entry
 * @route   POST /api/v1/exams/marks/bulk
 * @access  Private/Teacher, Admin
 */
const bulkMarksEntry = asyncHandler(async (req, res) => {
  try {
    const { exam_id, marks } = req.body;
    const schoolId = req.user.schoolId;

    const bulkOps = marks.map(markItem => ({
      updateOne: {
        filter: {
          exam_id,
          enrollment_id: markItem.enrollment_id,
          subject_id: markItem.subject_id,
          schoolId
        },
        update: {
          $set: { marks_obtained: markItem.marks }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Mark.bulkWrite(bulkOps);
    }

    return sendSuccess(res, 201, 'Marks saved successfully');
  } catch (error) {
    logger.error('Failed to save bulk marks', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

/**
 * @desc    Generate results for an exam
 * @route   GET /api/v1/exams/results/:examId
 * @access  Private
 */
const generateResults = asyncHandler(async (req, res) => {
  try {
    const examId = req.params.examId;
    const schoolId = req.user.schoolId;

    const results = await Mark.aggregate([
      {
        $match: {
          exam_id: new mongoose.Types.ObjectId(examId),
          schoolId: new mongoose.Types.ObjectId(schoolId)
        }
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollment_id',
          foreignField: '_id',
          as: 'enrollment'
        }
      },
      { $unwind: '$enrollment' },
      {
        $lookup: {
          from: 'studentprofiles',
          localField: 'enrollment.studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject_id',
          foreignField: '_id',
          as: 'subjectDetails'
        }
      },
      { $unwind: '$subjectDetails' },
      {
        $lookup: {
          from: 'exams',
          localField: 'exam_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: '$exam' },
      {
        $group: {
          _id: '$enrollment_id',
          student_name: {
            $first: {
              $concat: ['$student.firstName', ' ', '$student.lastName']
            }
          },
          subjects_list: {
            $push: {
              subject_name: '$subjectDetails.name',
              marks_obtained: '$marks_obtained'
            }
          },
          total: { $sum: '$marks_obtained' },
          examSubjects: { $first: '$exam.subjects' },
          subjectIds: { $push: '$subject_id' }
        }
      }
    ]);

    const postProcessedResults = results.map(result => {
      let max_total = 0;
      result.subjectIds.forEach(subId => {
        const subData = result.examSubjects.find(s => s.subject_id.toString() === subId.toString());
        if (subData) {
          max_total += subData.max_marks;
        }
      });

      const percentage = max_total > 0 ? ((result.total * 100) / max_total).toFixed(2) : 0;

      return {
        enrollment_id: result._id,
        student_name: result.student_name,
        subject_marks: result.subjects_list,
        total: result.total,
        percentage: Number(percentage)
      };
    });

    return sendSuccess(res, 200, 'Results generated successfully', postProcessedResults);
  } catch (error) {
    logger.error('Failed to generate results', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

/**
 * @desc    List exams
 * @route   GET /api/v1/exams
 * @access  Private
 */
const listExams = asyncHandler(async (req, res) => {
  try {
    const { class_id, exam_type } = req.query;
    const schoolId = req.user.schoolId;

    let query = { schoolId };

    if (class_id) query.class_id = class_id;
    if (exam_type) query.exam_type = exam_type;

    const exams = await Exam.find(query)
      .populate([
        { path: 'class_id', select: 'name' },
        { path: 'sections', select: 'name' },
        { path: 'subjects.subject_id', select: 'name code' }
      ])
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Exams retrieved successfully', exams);
  } catch (error) {
    logger.error('Failed to list exams', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

module.exports = {
  createExam,
  listExams,
  getExamStudents,
  bulkMarksEntry,
  generateResults
};
