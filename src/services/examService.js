const Exam = require('../models/Exam');
const ExamSubjectPaper = require('../models/ExamSubjectPaper');
const MarksEntry = require('../models/MarksEntry');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Enrollment = require('../models/Enrollment');
const { calculateResultSummary, calculateClassStatistics } = require('../utils/gradeCalculator');
const logger = require('../utils/logger');

/**
 * Exam Service - Handles all exam-related business logic
 */
class ExamService {
  /**
   * Create a new exam
   */
  static async createExam(examData, userId, schoolId) {
    try {
      // Validate class and section exist
      const classExists = await Class.findOne({
        _id: examData.classId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (!classExists) {
        throw new Error('Invalid class ID or class not found');
      }

      const sectionExists = await Section.findOne({
        _id: examData.sectionId,
        classId: examData.classId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (!sectionExists) {
        throw new Error('Invalid section ID or section not found');
      }

      // Check for duplicate exam name in same class/section/session
      const existingExam = await Exam.findOne({
        name: examData.name,
        classId: examData.classId,
        sectionId: examData.sectionId,
        sessionId: examData.sessionId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (existingExam) {
        throw new Error(`Exam with name '${examData.name}' already exists for this class and section`);
      }

      // Create exam
      const exam = await Exam.create({
        ...examData,
        schoolId,
        createdBy: userId
      });

      logger.info('Exam created successfully', {
        examId: exam._id,
        name: exam.name,
        classId: exam.classId,
        sectionId: exam.sectionId,
        createdBy: userId
      });

      return exam;
    } catch (error) {
      logger.error('Failed to create exam', {
        error: error.message,
        examData,
        userId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Update exam details
   */
  static async updateExam(examId, updateData, userId, schoolId) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      // Prevent updates if exam is completed or published
      if (['COMPLETED', 'PUBLISHED'].includes(exam.status)) {
        throw new Error('Cannot update exam that is completed or published');
      }

      // Update exam
      const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        {
          ...updateData,
          updatedBy: userId
        },
        { new: true, runValidators: true }
      );

      logger.info('Exam updated successfully', {
        examId,
        updatedFields: Object.keys(updateData),
        updatedBy: userId
      });

      return updatedExam;
    } catch (error) {
      logger.error('Failed to update exam', {
        error: error.message,
        examId,
        userId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Delete exam (soft delete)
   */
  static async deleteExam(examId, userId, schoolId) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      // Prevent deletion if exam is published
      if (exam.status === 'PUBLISHED') {
        throw new Error('Cannot delete published exam');
      }

      // Soft delete exam
      await Exam.findByIdAndUpdate(examId, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
      });

      // Soft delete related subject papers and marks entries
      await ExamSubjectPaper.updateMany(
        { examId, schoolId },
        { isDeleted: true, deletedAt: new Date(), deletedBy: userId }
      );

      await MarksEntry.updateMany(
        { examId, schoolId },
        { isDeleted: true, deletedAt: new Date(), deletedBy: userId }
      );

      logger.info('Exam deleted successfully', {
        examId,
        deletedBy: userId
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete exam', {
        error: error.message,
        examId,
        userId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Get exam details with subjects and marks
   */
  static async getExamDetails(examId, schoolId) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        schoolId,
        isDeleted: { $ne: true }
      })
      .populate([
        { path: 'classId', select: 'name' },
        { path: 'sectionId', select: 'name' },
        { path: 'sessionId', select: 'name year' },
        { path: 'createdBy', select: 'name email' }
      ]);

      if (!exam) {
        throw new Error('Exam not found');
      }

      // Get subject papers
      const subjectPapers = await ExamSubjectPaper.findByExam(examId, schoolId);

      // Get marks statistics
      const marksStats = await MarksEntry.getExamStatistics(examId, schoolId);

      return {
        exam,
        subjectPapers,
        marksStats
      };
    } catch (error) {
      logger.error('Failed to get exam details', {
        error: error.message,
        examId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * List exams for a class/section
   */
  static async listExams(filters, schoolId) {
    try {
      const { classId, sectionId, sessionId, status, examType } = filters;

      let query = {
        schoolId,
        isDeleted: { $ne: true }
      };

      if (classId) query.classId = classId;
      if (sectionId) query.sectionId = sectionId;
      if (sessionId) query.sessionId = sessionId;
      if (status) query.status = status;
      if (examType) query.examType = examType;

      const exams = await Exam.find(query)
        .populate([
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
          { path: 'sessionId', select: 'name year' },
          { path: 'createdBy', select: 'name email' }
        ])
        .sort({ startDate: -1 });

      return exams;
    } catch (error) {
      logger.error('Failed to list exams', {
        error: error.message,
        filters,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Assign subjects to exam
   */
  static async assignSubjects(examId, subjectAssignments, userId, schoolId) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      const createdPapers = [];

      for (const assignment of subjectAssignments) {
        // Validate subject exists
        const subject = await Subject.findOne({
          _id: assignment.subjectId,
          schoolId,
          isDeleted: { $ne: true }
        });

        if (!subject) {
          throw new Error(`Subject with ID ${assignment.subjectId} not found`);
        }

        // Check for duplicate assignment
        const existingPaper = await ExamSubjectPaper.checkSubjectAssignment(
          examId,
          assignment.subjectId,
          schoolId
        );

        if (existingPaper) {
          throw new Error(`Subject is already assigned to this exam`);
        }

        // Create exam subject paper
        const paper = await ExamSubjectPaper.create({
          examId,
          subjectId: assignment.subjectId,
          teacherId: assignment.teacherId,
          maxMarks: assignment.maxMarks,
          passingMarks: assignment.passingMarks,
          examDate: assignment.examDate,
          startTime: assignment.startTime,
          endTime: assignment.endTime,
          duration: assignment.duration,
          venue: assignment.venue,
          instructions: assignment.instructions,
          schoolId,
          createdBy: userId
        });

        createdPapers.push(paper);
      }

      logger.info('Subjects assigned to exam successfully', {
        examId,
        subjectCount: createdPapers.length,
        assignedBy: userId
      });

      return createdPapers;
    } catch (error) {
      logger.error('Failed to assign subjects to exam', {
        error: error.message,
        examId,
        subjectAssignments,
        userId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Bulk marks entry
   */
  static async bulkMarksEntry(examId, marksData, userId, schoolId) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      const createdEntries = [];
      const errors = [];

      for (const markData of marksData) {
        try {
          // Validate exam subject paper exists
          const subjectPaper = await ExamSubjectPaper.findOne({
            _id: markData.examSubjectPaperId,
            examId,
            schoolId,
            isDeleted: { $ne: true }
          });

          if (!subjectPaper) {
            throw new Error(`Subject paper not found`);
          }

          // Check for duplicate entry
          const existingEntry = await MarksEntry.checkDuplicateEntry(
            examId,
            markData.studentId,
            subjectPaper.subjectId,
            schoolId
          );

          if (existingEntry) {
            throw new Error(`Marks already entered for this student and subject`);
          }

          // Create marks entry
          const marksEntry = await MarksEntry.create({
            examId,
            studentId: markData.studentId,
            subjectId: subjectPaper.subjectId,
            examSubjectPaperId: subjectPaper._id,
            marksObtained: markData.marksObtained,
            maxMarks: subjectPaper.maxMarks,
            remarks: markData.remarks,
            enteredBy: userId,
            schoolId,
            createdBy: userId
          });

          createdEntries.push(marksEntry);
        } catch (error) {
          errors.push({
            studentId: markData.studentId,
            error: error.message
          });
        }
      }

      logger.info('Bulk marks entry completed', {
        examId,
        totalEntries: marksData.length,
        successful: createdEntries.length,
        failed: errors.length,
        enteredBy: userId
      });

      return {
        successful: createdEntries,
        failed: errors,
        summary: {
          total: marksData.length,
          successful: createdEntries.length,
          failed: errors.length
        }
      };
    } catch (error) {
      logger.error('Failed to bulk marks entry', {
        error: error.message,
        examId,
        marksData,
        userId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Generate exam results
   */
  static async generateResults(examId, schoolId) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        schoolId,
        isDeleted: { $ne: true }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      // Get all marks entries for the exam
      const marksEntries = await MarksEntry.findByExam(examId, schoolId);

      if (marksEntries.length === 0) {
        throw new Error('No marks entries found for this exam');
      }

      // Group marks by student
      const studentMarks = {};
      marksEntries.forEach(entry => {
        if (!studentMarks[entry.studentId]) {
          studentMarks[entry.studentId] = [];
        }
        studentMarks[entry.studentId].push(entry);
      });

      // Generate results for each student
      const results = [];
      for (const [studentId, marks] of Object.entries(studentMarks)) {
        try {
          const result = calculateResultSummary(marks, exam.passingPercentage);
          result.studentId = studentId;
          result.examId = examId;
          results.push(result);
        } catch (error) {
          logger.error('Failed to calculate result for student', {
            error: error.message,
            studentId,
            examId
          });
        }
      }

      // Calculate class statistics
      const classStatistics = calculateClassStatistics(results);

      logger.info('Exam results generated successfully', {
        examId,
        totalResults: results.length,
        averagePercentage: classStatistics.averagePercentage,
        passPercentage: classStatistics.passPercentage
      });

      return {
        exam,
        results,
        classStatistics
      };
    } catch (error) {
      logger.error('Failed to generate exam results', {
        error: error.message,
        examId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Lock/unlock marks
   */
  static async toggleMarksLock(examId, subjectId, lock, userId, schoolId) {
    try {
      const query = {
        examId,
        subjectId,
        schoolId,
        isDeleted: { $ne: true }
      };

      const update = {
        locked: lock,
        lastModifiedBy: userId
      };

      if (lock) {
        update.lockedAt = new Date();
        update.lockedBy = userId;
      }

      const result = await MarksEntry.updateMany(query, update);

      logger.info(`Marks ${lock ? 'locked' : 'unlocked'} successfully`, {
        examId,
        subjectId,
        lockedCount: result.modifiedCount,
        modifiedBy: userId
      });

      return result;
    } catch (error) {
      logger.error('Failed to toggle marks lock', {
        error: error.message,
        examId,
        subjectId,
        lock,
        userId,
        schoolId
      });
      throw error;
    }
  }

  /**
   * Get student's result for an exam
   */
  static async getStudentResult(examId, studentId, schoolId) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        schoolId,
        status: 'PUBLISHED',
        isDeleted: { $ne: true }
      });

      if (!exam) {
        throw new Error('Exam not found or not published');
      }

      const marksEntries = await MarksEntry.find({
        examId,
        studentId,
        schoolId,
        isDeleted: { $ne: true }
      })
      .populate([
        { path: 'subjectId', select: 'name code department' },
        { path: 'enteredBy', select: 'name email' }
      ]);

      if (marksEntries.length === 0) {
        throw new Error('No marks found for this student in this exam');
      }

      const result = calculateResultSummary(marksEntries, exam.passingPercentage);
      result.exam = exam;
      result.studentId = studentId;

      return result;
    } catch (error) {
      logger.error('Failed to get student result', {
        error: error.message,
        examId,
        studentId,
        schoolId
      });
      throw error;
    }
  }
}

module.exports = ExamService;
