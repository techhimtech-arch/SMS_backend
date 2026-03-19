const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');

// Controller imports
const {
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
} = require('../controllers/assignmentController');

// Validator imports
const {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateSubmitAssignment,
  validateGradeSubmission,
  validateListAssignments,
  validateMongoId
} = require('../validators/assignmentValidator');

// Apply auth middleware to all routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - subjectId
 *         - classId
 *         - sectionId
 *         - dueDate
 *         - maxMarks
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the assignment
 *         title:
 *           type: string
 *           description: The title of the assignment
 *           maxLength: 200
 *         description:
 *           type: string
 *           description: The description of the assignment
 *           maxLength: 5000
 *         subjectId:
 *           type: string
 *           description: Reference to Subject model
 *         classId:
 *           type: string
 *           description: Reference to Class model
 *         sectionId:
 *           type: string
 *           description: Reference to Section model
 *         teacherId:
 *           type: string
 *           description: Reference to User model (teacher)
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Assignment due date
 *         maxMarks:
 *           type: number
 *           description: Maximum marks for the assignment
 *           minimum: 0
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               originalName:
 *                 type: string
 *               mimetype:
 *                 type: string
 *               size:
 *                 type: number
 *               url:
 *                 type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CLOSED]
 *           default: DRAFT
 *         allowLateSubmission:
 *           type: boolean
 *           default: false
 *         lateSubmissionPenalty:
 *           type: number
 *           description: Percentage penalty for late submission
 *           minimum: 0
 *           maximum: 100
 *         createdBy:
 *           type: string
 *           description: Reference to User model
 *         updatedBy:
 *           type: string
 *           description: Reference to User model
 *         isDeleted:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AssignmentSubmission:
 *       type: object
 *       required:
 *         - assignmentId
 *         - studentId
 *       properties:
 *         _id:
 *           type: string
 *         assignmentId:
 *           type: string
 *           description: Reference to Assignment model
 *         studentId:
 *           type: string
 *           description: Reference to User model (student)
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         submissionText:
 *           type: string
 *         attachment:
 *           type: object
 *         marksObtained:
 *           type: number
 *         remarks:
 *           type: string
 *         status:
 *           type: string
 *           enum: [SUBMITTED, LATE, GRADED]
 *         isLate:
 *           type: boolean
 *         lateSubmissionReason:
 *           type: string
 *         gradedAt:
 *           type: string
 *           format: date-time
 *         gradedBy:
 *           type: string
 *           description: Reference to User model
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/assignments:
 *   post:
 *     summary: Create a new assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assignment'
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', validateCreateAssignment, createAssignment);

/**
 * @swagger
 * /api/v1/assignments:
 *   get:
 *     summary: Get all assignments with filtering
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CLOSED]
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, createdAt, title, maxMarks]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of assignments
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateListAssignments, getAssignments);

/**
 * @swagger
 * /api/v1/assignments/{id}:
 *   get:
 *     summary: Get a single assignment by ID
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 */
router.get('/:id', validateMongoId, getAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}:
 *   put:
 *     summary: Update an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assignment'
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 */
router.put('/:id', validateMongoId, validateUpdateAssignment, updateAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}:
 *   delete:
 *     summary: Delete an assignment (soft delete)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 */
router.delete('/:id', validateMongoId, deleteAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}/publish:
 *   post:
 *     summary: Publish an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 */
router.post('/:id/publish', validateMongoId, publishAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}/close:
 *   post:
 *     summary: Close an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment closed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 */
router.post('/:id/close', validateMongoId, closeAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}/submit:
 *   post:
 *     summary: Submit an assignment (Student only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submissionText:
 *                 type: string
 *               attachment:
 *                 type: object
 *               lateSubmissionReason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assignment submitted successfully
 *       400:
 *         description: Validation error or already submitted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 */
router.post('/:id/submit', validateMongoId, validateSubmitAssignment, submitAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}/submissions:
 *   get:
 *     summary: Get all submissions for an assignment (Teacher/Admin only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMITTED, LATE, GRADED]
 *     responses:
 *       200:
 *         description: List of submissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 */
router.get('/:id/submissions', validateMongoId, getSubmissions);

/**
 * @swagger
 * /api/v1/assignments/{id}/grade:
 *   post:
 *     summary: Grade a submission (Teacher/Admin only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - submissionId
 *               - marksObtained
 *             properties:
 *               submissionId:
 *                 type: string
 *               marksObtained:
 *                 type: number
 *                 minimum: 0
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       400:
 *         description: Validation error or marks exceed max
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment or submission not found
 */
router.post('/:id/grade', validateMongoId, validateGradeSubmission, gradeSubmission);

module.exports = router;
