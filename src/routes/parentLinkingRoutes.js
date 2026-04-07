const express = require('express');
const { linkParentToStudent, unlinkParentFromStudent, getLinkedStudents, getStudentLinkedParents } = require('../controllers/parentLinkingController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * Link a parent to a student (Admin only)
 * POST /api/v1/parent-linking/:studentId/link/:parentId
 */
router.post(
  '/:studentId/link/:parentId',
  authMiddleware,
  authorizeRoles('school_admin'),
  linkParentToStudent
);

/**
 * Unlink a parent from a student (Admin only)
 * DELETE /api/v1/parent-linking/:studentId/unlink/:parentId
 */
router.delete(
  '/:studentId/unlink/:parentId',
  authMiddleware,
  authorizeRoles('school_admin'),
  unlinkParentFromStudent
);

/**
 * Get all students linked to a parent
 * GET /api/v1/parent-linking/parent/:parentId/students
 */
router.get(
  '/parent/:parentId/students',
  authMiddleware,
  authorizeRoles('school_admin', 'parent'),
  getLinkedStudents
);

/**
 * Get all parents linked to a student
 * GET /api/v1/parent-linking/student/:studentId/parents
 */
router.get(
  '/student/:studentId/parents',
  authMiddleware,
  authorizeRoles('school_admin'),
  getStudentLinkedParents
);

module.exports = router;