const express = require('express');
const router = express.Router();
const {
  createExam,
  updateExam,
  deleteExam,
  getExamDetails,
  listExams,
  assignSubjects,
  getExamPapers,
  updateSubjectPaper,
  removeSubjectPaper,
  bulkMarksEntry,
  getExamMarks,
  updateMarks,
  lockMarks,
  unlockMarks,
  generateResults,
  getExamResults,
  getStudentResult
} = require('../controllers/examController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  validateCreateExam,
  validateUpdateExam,
  validateAssignSubjects,
  validateUpdateSubjectPaper,
  validateBulkMarksEntry,
  validateUpdateMarks,
  validateLockMarks,
  validateListExams,
  validateMongoId,
  validateMarksId,
  validateStudentId
} = require('../validators/examValidator');

/**
 * @swagger
 * tags:
 *   name: Exam Management
 *   description: Production-grade exam management system with marks entry and results
 */

/**
 * @swagger
 * /exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - examType
 *               - sessionId
 *               - classId
 *               - sectionId
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Exam name
 *               examType:
 *                 type: string
 *                 enum: [UNIT_TEST, MID_TERM, FINAL_TERM, PRACTICAL, VIVA, QUIZ, ASSIGNMENT]
 *                 default: UNIT_TEST
 *                 description: Type of exam
 *               sessionId:
 *                 type: string
 *                 description: Academic session ID
 *               classId:
 *                 type: string
 *                 description: Class ID
 *               sectionId:
 *                 type: string
 *                 description: Section ID
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Exam start date
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Exam end date
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Exam description
 *               instructions:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Exam instructions
 *               passingPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 40
 *                 description: Passing percentage
 *               duration:
 *                 type: number
 *                 minimum: 1
 *                 description: Duration in minutes
 *               venue:
 *                 type: string
 *                 maxLength: 200
 *                 description: Exam venue
 *     responses:
 *       201:
 *         description: Exam created successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, validateCreateExam, createExam);

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: List exams with filters
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Filter by section ID
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Filter by academic session ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, PUBLISHED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: examType
 *         schema:
 *           type: string
 *           enum: [UNIT_TEST, MID_TERM, FINAL_TERM, PRACTICAL, VIVA, QUIZ, ASSIGNMENT]
 *         description: Filter by exam type
 *     responses:
 *       200:
 *         description: Exams retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, validateListExams, listExams);

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     summary: Get exam details with subjects and marks statistics
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, validateMongoId, getExamDetails);

/**
 * @swagger
 * /exams/{id}:
 *   put:
 *     summary: Update exam details
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *               examType:
 *                 type: string
 *                 enum: [UNIT_TEST, MID_TERM, FINAL_TERM, PRACTICAL, VIVA, QUIZ, ASSIGNMENT]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               instructions:
 *                 type: string
 *                 maxLength: 2000
 *               passingPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               duration:
 *                 type: number
 *                 minimum: 1
 *               venue:
 *                 type: string
 *                 maxLength: 200
 *               status:
 *                 type: string
 *                 enum: [DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, PUBLISHED, CANCELLED]
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, validateMongoId, validateUpdateExam, updateExam);

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     summary: Delete exam
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, validateMongoId, deleteExam);

/**
 * @swagger
 * /exams/{id}/papers:
 *   post:
 *     summary: Assign subjects to exam
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectAssignments
 *             properties:
 *               subjectAssignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - subjectId
 *                     - teacherId
 *                     - maxMarks
 *                     - passingMarks
 *                     - examDate
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     subjectId:
 *                       type: string
 *                       description: Subject ID
 *                     teacherId:
 *                       type: string
 *                       description: Teacher ID
 *                     maxMarks:
 *                       type: number
 *                       minimum: 1
 *                       maximum: 1000
 *                       description: Maximum marks
 *                     passingMarks:
 *                       type: number
 *                       minimum: 0
 *                       description: Passing marks
 *                     examDate:
 *                       type: string
 *                       format: date-time
 *                       description: Exam date
 *                     startTime:
 *                       type: string
 *                       pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *                       description: Start time (HH:MM)
 *                     endTime:
 *                       type: string
 *                       pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *                       description: End time (HH:MM)
 *                     duration:
 *                       type: number
 *                       minimum: 1
 *                       description: Duration in minutes
 *                     venue:
 *                       type: string
 *                       maxLength: 200
 *                       description: Exam venue
 *                     instructions:
 *                       type: string
 *                       maxLength: 2000
 *                       description: Paper instructions
 *     responses:
 *       201:
 *         description: Subjects assigned successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/papers', authMiddleware, validateMongoId, validateAssignSubjects, assignSubjects);

/**
 * @swagger
 * /exams/{id}/papers:
 *   get:
 *     summary: Get exam subject papers
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam papers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/papers', authMiddleware, validateMongoId, getExamPapers);

/**
 * @swagger
 * /exams/{id}/papers/{paperId}:
 *   put:
 *     summary: Update subject paper
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: string
 *         description: Paper ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxMarks:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 1000
 *               passingMarks:
 *                 type: number
 *                 minimum: 0
 *               examDate:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *               endTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
 *               duration:
 *                 type: number
 *                 minimum: 1
 *               venue:
 *                 type: string
 *                 maxLength: 200
 *               instructions:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Subject paper updated successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject paper not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/papers/:paperId', authMiddleware, validateMongoId, validateUpdateSubjectPaper, updateSubjectPaper);

/**
 * @swagger
 * /exams/{id}/papers/{paperId}:
 *   delete:
 *     summary: Remove subject paper
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: string
 *         description: Paper ID
 *     responses:
 *       200:
 *         description: Subject paper removed successfully
 *       400:
 *         description: Cannot remove paper with marks entered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject paper not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/papers/:paperId', authMiddleware, validateMongoId, removeSubjectPaper);

/**
 * @swagger
 * /exams/{id}/marks:
 *   post:
 *     summary: Bulk marks entry
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marksData
 *             properties:
 *               marksData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - examSubjectPaperId
 *                     - marksObtained
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       description: Student ID
 *                     examSubjectPaperId:
 *                       type: string
 *                       description: Subject paper ID
 *                     marksObtained:
 *                       type: number
 *                       minimum: 0
 *                       description: Marks obtained
 *                     remarks:
 *                       type: string
 *                       maxLength: 500
 *                       description: Remarks
 *     responses:
 *       201:
 *         description: Marks entry completed
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/marks', authMiddleware, validateMongoId, validateBulkMarksEntry, bulkMarksEntry);

/**
 * @swagger
 * /exams/{id}/marks:
 *   get:
 *     summary: Get exam marks
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam marks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/marks', authMiddleware, validateMongoId, getExamMarks);

/**
 * @swagger
 * /exams/{id}/marks/{marksId}:
 *   put:
 *     summary: Update marks
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *       - in: path
 *         name: marksId
 *         required: true
 *         schema:
 *           type: string
 *         description: Marks ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marksObtained:
 *                 type: number
 *                 minimum: 0
 *                 description: Marks obtained
 *               remarks:
 *                 type: string
 *                 maxLength: 500
 *                 description: Remarks
 *               teacherRemarks:
 *                 type: string
 *                 maxLength: 500
 *                 description: Teacher remarks
 *     responses:
 *       200:
 *         description: Marks updated successfully
 *       400:
 *         description: Bad request or marks locked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Marks not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/marks/:marksId', authMiddleware, validateMongoId, validateMarksId, validateUpdateMarks, updateMarks);

/**
 * @swagger
 * /exams/{id}/marks/lock:
 *   put:
 *     summary: Lock marks
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: Subject ID to lock
 *     responses:
 *       200:
 *         description: Marks locked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.put('/:id/marks/lock', authMiddleware, validateMongoId, validateLockMarks, lockMarks);

/**
 * @swagger
 * /exams/{id}/marks/unlock:
 *   put:
 *     summary: Unlock marks
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *             properties:
 *               subjectId:
 *                 type: string
 *                 description: Subject ID to unlock
 *     responses:
 *       200:
 *         description: Marks unlocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.put('/:id/marks/unlock', authMiddleware, validateMongoId, validateLockMarks, unlockMarks);

/**
 * @swagger
 * /exams/{id}/results:
 *   post:
 *     summary: Generate exam results
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Results generated successfully
 *       400:
 *         description: No marks found for exam
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/results', authMiddleware, validateMongoId, generateResults);

/**
 * @swagger
 * /exams/{id}/results:
 *   get:
 *     summary: Get exam results
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam results retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/results', authMiddleware, validateMongoId, getExamResults);

/**
 * @swagger
 * /exams/{id}/student/{studentId}:
 *   get:
 *     summary: Get student result for exam
 *     tags: [Exam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student result retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found or not published
 *       500:
 *         description: Internal server error
 */
router.get('/:id/student/:studentId', authMiddleware, validateMongoId, validateStudentId, getStudentResult);

module.exports = router;
