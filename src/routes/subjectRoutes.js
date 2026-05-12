const express = require('express');
const router = express.Router();
const {
  createSubject,
  getAllSubjects,
  getSubjectsByClass,
  getSubjectsByTeacher,
  updateSubject,
  deleteSubject,
  assignTeacherToSubject,
  removeTeacherFromSubject,
  getOptionalSubjects,
  bulkCreateSubjects,
  cloneSubjects,
  migrateSubjectsToNextYear
} = require('../controllers/subjectController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Academic subject management with teacher assignments
 */

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
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
 *               - code
 *               - classId
 *               - academicYearId
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               classId:
 *                 type: string
 *               academicYearId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 */
router.post('/', authMiddleware, createSubject);

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Get all subjects for a school
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get('/', authMiddleware, getAllSubjects);

/**
 * @swagger
 * /subjects/bulk:
 *   post:
 *     summary: Bulk create subjects for a class
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Subjects created successfully
 */
router.post('/bulk', authMiddleware, bulkCreateSubjects);

/**
 * @swagger
 * /subjects/clone:
 *   post:
 *     summary: Clone subjects from one class to another
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Subjects cloned successfully
 */
router.post('/clone', authMiddleware, cloneSubjects);

/**
 * @swagger
 * /subjects/migrate:
 *   post:
 *     summary: Migrate subjects to next academic year
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Subjects migrated successfully
 */
router.post('/migrate', authMiddleware, migrateSubjectsToNextYear);

/**
 * @swagger
 * /subjects/class/{classId}:
 *   get:
 *     summary: Get subjects by class
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 */
router.get('/class/:classId', authMiddleware, getSubjectsByClass);

/**
 * @swagger
 * /subjects/teacher/{teacherId}:
 *   get:
 *     summary: Get subjects assigned to a teacher
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher subjects retrieved successfully
 */
router.get('/teacher/:teacherId', authMiddleware, getSubjectsByTeacher);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Update subject
 *     tags: [Subjects]
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
 *         description: Subject updated successfully
 */
router.put('/:id', authMiddleware, updateSubject);
router.patch('/:id', authMiddleware, updateSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Delete subject (soft delete)
 *     tags: [Subjects]
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
 *         description: Subject deleted successfully
 */
router.delete('/:id', authMiddleware, deleteSubject);

/**
 * @swagger
 * /subjects/{subjectId}/assign-teacher:
 *   post:
 *     summary: Assign teacher to subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Teacher assigned to subject successfully
 */
router.post('/:subjectId/assign-teacher', authMiddleware, assignTeacherToSubject);

/**
 * @swagger
 * /subjects/{subjectId}/remove-teacher/{teacherId}:
 *   delete:
 *     summary: Remove teacher assignment from subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher removed from subject successfully
 */
router.delete('/:subjectId/remove-teacher/:teacherId', authMiddleware, removeTeacherFromSubject);

/**
 * @swagger
 * /subjects/optional/{classId}:
 *   get:
 *     summary: Get optional subjects for a class
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Optional subjects retrieved successfully
 */
router.get('/optional/:classId', authMiddleware, getOptionalSubjects);

module.exports = router;
