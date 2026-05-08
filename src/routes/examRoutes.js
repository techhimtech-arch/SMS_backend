const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam management system
 */

// Apply auth protection to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authorizePermissions([PERMISSIONS.EXAM_CREATE]),
  examController.createExam
);

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: List exams
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authorizePermissions([PERMISSIONS.EXAM_READ]),
  examController.listExams
);

/**
 * @swagger
 * /exams/{id}/students:
 *   get:
 *     summary: Get students for an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/students',
  authorizePermissions([PERMISSIONS.EXAM_READ]),
  examController.getExamStudents
);

/**
 * @swagger
 * /exams/marks/bulk:
 *   post:
 *     summary: Bulk marks entry
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/marks/bulk',
  authorizePermissions([PERMISSIONS.EXAM_CREATE]),
  examController.bulkMarksEntry
);

/**
 * @swagger
 * /exams/results/{examId}:
 *   get:
 *     summary: Generate exam results
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/results/:examId',
  authorizePermissions([PERMISSIONS.EXAM_READ]),
  examController.generateResults
);

module.exports = router;
