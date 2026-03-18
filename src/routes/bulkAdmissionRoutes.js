const express = require('express');
const router = express.Router();
const {
  bulkPartialAdmissions,
  getBulkTemplate,
  bulkCompleteAdmissions,
  upload
} = require('../controllers/bulkAdmissionController');

const authMiddleware = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthorization');

/**
 * @swagger
 * tags:
 *   name: Bulk Admission
 *   description: Bulk admission management routes
 */

/**
 * @swagger
 * /admission/bulk/template:
 *   get:
 *     summary: Download bulk admission template
 *     tags: [Bulk Admission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV template file downloaded
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/template', authMiddleware, authorizeRoles('school_admin', 'teacher'), getBulkTemplate);

/**
 * @swagger
 * /admission/bulk:
 *   post:
 *     summary: Bulk create partial admissions from CSV/Excel
 *     tags: [Bulk Admission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing student data
 *     responses:
 *       200:
 *         description: Bulk admission processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: integer
 *                     successCount:
 *                       type: integer
 *                     errorCount:
 *                       type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       studentId:
 *                         type: string
 *                       message:
 *                         type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                       data:
 *                           type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad request or invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, authorizeRoles('school_admin', 'teacher'), upload.single('file'), bulkPartialAdmissions);

/**
 * @swagger
 * /admission/bulk/complete:
 *   put:
 *     summary: Bulk complete partial admissions
 *     tags: [Bulk Admission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of student IDs to complete
 *               updates:
 *                 type: object
 *                 properties:
 *                   classId:
 *                     type: string
 *                     description: Class ID to assign
 *                   sectionId:
 *                     type: string
 *                     description: Section ID to assign
 *                   parentUserId:
 *                     type: string
 *                     description: Parent user ID
 *                   rollNumber:
 *                     type: string
 *                     description: Roll number
 *                   bloodGroup:
 *                     type: string
 *                     enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                     description: Blood group
 *                   admissionNumber:
 *                     type: string
 *                     description: Admission number
 *     responses:
 *       200:
 *         description: Bulk completion processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/complete', authMiddleware, authorizeRoles('school_admin', 'teacher'), bulkCompleteAdmissions);

module.exports = router;
