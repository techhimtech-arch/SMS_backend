const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const RefactoredExam = require('../models/RefactoredExam');
const RefactoredMark = require('../models/RefactoredMark');
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
 * 1. POST /exams
 * Body: { name, class_id, exam_type, sections: [], subjects: [{subject_id, max_marks}] }
 */
const createExam = asyncHandler(async (req, res) => {
  try {
    const { name, class_id, exam_type, sections, subjects, targets } = req.body;
    
    // Using schoolId from req.user as per system standards
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

    const existingExams = await RefactoredExam.find({
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

    const createdExams = await RefactoredExam.create(examDocuments);

    return sendSuccess(
      res,
      201,
      createdExams.length > 1 ? 'Exams created successfully' : 'Exam created successfully',
      createdExams.length === 1 ? createdExams[0] : createdExams
    );
  } catch (error) {
    logger.error('Failed to create refactored exam', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

/**
 * 2. GET /exams/:id/students
 * Return: enrollment_id, student_id, student_name (from enrollments)
 */
const getExamStudents = asyncHandler(async (req, res) => {
  try {
    const examId = req.params.id;
    const schoolId = req.user.schoolId;

    const exam = await RefactoredExam.findOne({ _id: examId, schoolId });
    if (!exam) {
      return sendError(res, 404, 'Exam not found');
    }

    // Fetch active enrollments for the exam's sections
    const students = await Enrollment.find({
      classId: exam.class_id,
      sectionId: { $in: exam.sections },
      schoolId,
      status: 'ENROLLED',
      isDeleted: { $ne: true }
    }).populate('studentId', 'firstName lastName'); // populate to get student name

    // Format output as requested
    const formattedStudents = students.map(enr => ({
      enrollment_id: enr._id,
      student_id: enr.studentId._id,
      student_name: `${enr.studentId.firstName} ${enr.studentId.lastName}`.trim()
    }));

    return sendSuccess(res, 200, 'Students retrieved successfully', formattedStudents);
  } catch (error) {
    logger.error('Failed to fetch exam students', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

/**
 * 3. POST /marks/bulk
 * Body: { exam_id, marks: [{ enrollment_id, subject_id, marks }] }
 */
const bulkMarksEntry = asyncHandler(async (req, res) => {
  try {
    const { exam_id, marks } = req.body;
    const schoolId = req.user.schoolId;

    // Build the bulk upsert operations
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
      await RefactoredMark.bulkWrite(bulkOps);
    }

    return sendSuccess(res, 201, 'Marks saved successfully');
  } catch (error) {
    logger.error('Failed to save bulk marks', { error: error.message });
    return sendError(res, 500, error.message);
  }
});

/**
 * 4. GET /results/:examId
 * Return: student name, subject-wise marks, total, percentage
 */
const generateResults = asyncHandler(async (req, res) => {
  try {
    const examId = req.params.examId;
    const schoolId = req.user.schoolId;

    const results = await RefactoredMark.aggregate([
      // 1. Match marks for this exam
      {
        $match: {
          exam_id: new mongoose.Types.ObjectId(examId),
          schoolId: new mongoose.Types.ObjectId(schoolId)
        }
      },
      // 2. Join with Enrollments to get student pointer
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollment_id',
          foreignField: '_id',
          as: 'enrollment'
        }
      },
      { $unwind: '$enrollment' },
      // 3. Join with StudentProfiles to get student name
      {
        $lookup: {
          from: 'studentprofiles',
          localField: 'enrollment.studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      // 4. Join with subjects to get subject name
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject_id',
          foreignField: '_id',
          as: 'subjectDetails'
        }
      },
      { $unwind: '$subjectDetails' },
      // 5. Join with RefactoredExam to get max marks for those subjects
      {
        $lookup: {
          from: 'refactoredexams',
          localField: 'exam_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: '$exam' },
      // 6. Group by enrollment to aggregate marks and subjects array
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
          // We need to calculate the max total.
          // Since the exam subjects array has { subject_id, max_marks },
          // we match the current subject_id to find max_marks.
          examSubjects: { $first: '$exam.subjects' },
          subjectIds: { $push: '$subject_id' }
        }
      }
    ]);

    // 7. Post-process to calculate percentages based on max_marks
    const postProcessedResults = results.map(result => {
      // Find the max marks for the subjects the student actually appeared for
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
 * LIST /exams
 * Query: ?class_id=..., ?exam_type=...
 */
const listExams = asyncHandler(async (req, res) => {
  try {
    const { class_id, exam_type } = req.query;
    const schoolId = req.user.schoolId;

    let query = { schoolId };

    if (class_id) query.class_id = class_id;
    if (exam_type) query.exam_type = exam_type;

    const exams = await RefactoredExam.find(query)
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
