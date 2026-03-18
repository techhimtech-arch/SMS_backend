const express = require('express');
const router = express.Router();
const {
  createSubject,
  getSubjectsByClass,
  getSubjectsByTeacher,
  updateSubject,
  deleteSubject,
  assignTeacherToSubject,
  removeTeacherFromSubject,
  getOptionalSubjects
} = require('../controllers/enhancedSubjectController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Enhanced Subjects
 *   description: Academic subject management with teacher assignments
 */

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Enhanced Subjects]
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
 *               - academicSessionId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Subject name
 *                 example: "Mathematics"
 *               code:
 *                 type: string
 *                 maxLength: 20
 *                 description: Subject code (will be converted to uppercase)
 *                 example: "MATH101"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Subject description
 *                 example: "Advanced Mathematics for Grade 10"
 *               classId:
 *                 type: string
 *                 description: Class ID
 *                 example: "65aa221b8f9e8a001c9e4a1b"
 *               department:
 *                 type: string
 *                 enum: [SCIENCE, COMMERCE, ARTS, LANGUAGE, MATHEMATICS, PHYSICAL_EDUCATION, COMPUTER_SCIENCE, OTHER]
 *                 description: Academic department
 *                 example: "MATHEMATICS"
 *               academicSessionId:
 *                 type: string
 *                 description: Academic session ID
 *                 example: "65aa221b8f9e8a001c9e4a1c"
 *               teacherIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of teacher IDs to assign
 *                 example: ["65aa221b8f9e8a001c9e4a1b", "65aa221b8f9e8a001c9e4a1c"]
 *               isOptional:
 *                 type: boolean
 *                 description: Whether subject is optional
 *                 example: false
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 description: Subject status
 *                 example: "ACTIVE"
 *               credits:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Subject credits
 *                 example: 3
 *               weeklyHours:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 40
 *                 description: Weekly teaching hours
 *                 example: 6
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of prerequisite subject IDs
 *                 example: []
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Subject created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     classId:
 *                       type: string
 *                     department:
 *                       type: string
 *                     isOptional:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                     credits:
 *                       type: number
 *                     weeklyHours:
 *                       type: number
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, createSubject);

/**
 * @swagger
 * /subjects/class/{classId}:
 *   get:
 *     summary: Get subjects by class
 *     tags: [Enhanced Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: academicSessionId
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for subject name, code, or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by subject status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *           enum: [SCIENCE, COMMERCE, ARTS, LANGUAGE, MATHEMATICS, PHYSICAL_EDUCATION, COMPUTER_SCIENCE, OTHER]
 *         description: Filter by department
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Subjects retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       description:
 *                         type: string
 *                       department:
 *                         type: string
 *                       isOptional:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       credits:
 *                         type: number
 *                       weeklyHours:
 *                         type: number
 *                       teacherIds:
 *                         type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.get('/class/:classId', authMiddleware, getSubjectsByClass);

/**
 * @swagger
 * /subjects/teacher/{teacherId}:
 *   get:
 *     summary: Get subjects assigned to a teacher
 *     tags: [Enhanced Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *       - in: query
 *         name: academicSessionId
 *         schema:
 *           type: string
 *         description: Academic session ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for subject name, code, or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Teacher subjects retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only view own subjects
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.get('/teacher/:teacherId', authMiddleware, getSubjectsByTeacher);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Update subject
 *     tags: [Enhanced Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Subject name
 *               code:
 *                 type: string
 *                 maxLength: 20
 *                 description: Subject code (will be converted to uppercase)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Subject description
 *               department:
 *                 type: string
 *                 enum: [SCIENCE, COMMERCE, ARTS, LANGUAGE, MATHEMATICS, PHYSICAL_EDUCATION, COMPUTER_SCIENCE, OTHER]
 *                 description: Academic department
 *               isOptional:
 *                 type: boolean
 *                 description: Whether subject is optional
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 description: Subject status
 *               credits:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Subject credits
 *               weeklyHours:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 40
 *                 description: Weekly teaching hours
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of prerequisite subject IDs
 *               teacherIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of teacher IDs to assign
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, updateSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Delete subject (soft delete)
 *     tags: [Enhanced Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, deleteSubject);

/**
 * @swagger
 * /subjects/{subjectId}/assign-teacher:
 *   post:
 *     summary: Assign teacher to subject
 *     tags: [Enhanced Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacherId
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: Teacher ID to assign
 *               sectionId:
 *                 type: string
 *                 description: Section ID (optional)
 *               role:
 *                 type: string
 *                 enum: [PRIMARY_TEACHER, ASSISTANT_TEACHER, SUBSTITUTE_TEACHER]
 *                 default: PRIMARY_TEACHER
 *                 description: Teacher role for this subject
 *     responses:
 *       201:
 *         description: Teacher assigned to subject successfully
 *       400:
 *         description: Bad request or teacher already assigned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.post('/:subjectId/assign-teacher', authMiddleware, assignTeacherToSubject);

/**
 * @swagger
 * /subjects/{subjectId}/remove-teacher/{teacherId}:
 *   delete:
 *     summary: Remove teacher assignment from subject
 *     tags: [Enhanced Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID to remove
 *     responses:
 *       200:
 *         description: Teacher removed from subject successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:subjectId/remove-teacher/:teacherId', authMiddleware, removeTeacherFromSubject);

/**
 * @swagger
 * /subjects/optional/{classId}:
 *   get:
 *     summary: Get optional subjects for a class
 *     tags: [Enhanced Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: academicSessionId
 *         schema:
 *           type: string
 *         description: Academic session ID
 *     responses:
 *       200:
 *         description: Optional subjects retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.get('/optional/:classId', authMiddleware, getOptionalSubjects);

module.exports = router;
