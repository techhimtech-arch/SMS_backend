const express = require('express');
const router = express.Router();
const refactoredExamController = require('../controllers/refactoredExamController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

// Apply strictly auth protection to all routes
router.use(protect);

/**
 * Exams Endpoints
 */
router.post(
  '/exams',
  authorizePermissions([PERMISSIONS.EXAM_CREATE]),
  refactoredExamController.createExam
);

router.get(
  '/exams/:id/students',
  authorizePermissions([PERMISSIONS.EXAM_READ]),
  refactoredExamController.getExamStudents
);

/**
 * Marks Endpoints
 */
router.post(
  '/marks/bulk',
  authorizePermissions([PERMISSIONS.EXAM_CREATE]),
  refactoredExamController.bulkMarksEntry
);

/**
 * Results Endpoints
 */
router.get(
  '/results/:examId',
  authorizePermissions([PERMISSIONS.EXAM_READ]),
  refactoredExamController.generateResults
);

module.exports = router;
