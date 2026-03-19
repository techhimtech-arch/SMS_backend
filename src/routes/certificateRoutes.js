const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuthorization');
const { body, param } = require('express-validator');
const { handleValidation } = require('../validators/feeValidator');

const {
  generateCertificate,
  getStudentCertificates,
  getCertificate,
  verifyCertificate,
  cancelCertificate,
  deleteCertificate,
  verifyByCode,
  getCertificateTemplates
} = require('../controllers/certificateController');

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Certificate generation and management APIs
 */

/**
 * @swagger
 * /certificates/templates:
 *   get:
 *     summary: Get available certificate templates
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificate templates retrieved successfully
 */
router.get('/templates', protect, authorizeRoles('admin', 'principal', 'clerk'), getCertificateTemplates);

/**
 * @swagger
 * /certificates/generate:
 *   post:
 *     summary: Generate a new certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - certificateType
 *               - dataPayload
 *             properties:
 *               studentId:
 *                 type: string
 *               certificateType:
 *                 type: string
 *                 enum: [TRANSFER_CERTIFICATE, CHARACTER_CERTIFICATE, BONAFIDE_CERTIFICATE, MERIT_CERTIFICATE, STUDY_CERTIFICATE, ATTENDANCE_CERTIFICATE, LEAVING_CERTIFICATE, CONDUCT_CERTIFICATE]
 *               dataPayload:
 *                 type: object
 *               purpose:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Certificate generated successfully
 *       404:
 *         description: Student not found
 */
router.post('/generate',
  protect,
  authorizeRoles('admin', 'principal', 'clerk'),
  [
    body('studentId').notEmpty().isMongoId().withMessage('Valid student ID is required'),
    body('certificateType').notEmpty().isIn([
      'TRANSFER_CERTIFICATE', 'CHARACTER_CERTIFICATE', 'BONAFIDE_CERTIFICATE',
      'MERIT_CERTIFICATE', 'STUDY_CERTIFICATE', 'ATTENDANCE_CERTIFICATE',
      'LEAVING_CERTIFICATE', 'CONDUCT_CERTIFICATE'
    ]).withMessage('Valid certificate type is required'),
    body('dataPayload').isObject().withMessage('Data payload is required'),
    handleValidation
  ],
  generateCertificate
);

/**
 * @swagger
 * /certificates/student/{studentId}:
 *   get:
 *     summary: Get all certificates for a student
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student certificates retrieved successfully
 */
router.get('/student/:studentId',
  protect,
  authorizeRoles('admin', 'principal', 'clerk', 'student', 'parent'),
  [param('studentId').notEmpty().isMongoId(), handleValidation],
  getStudentCertificates
);

/**
 * @swagger
 * /certificates/verify/{code}:
 *   get:
 *     summary: Verify certificate by verification code (Public)
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate verified successfully
 *       404:
 *         description: Invalid or expired certificate
 */
router.get('/verify/:code', verifyByCode);

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     summary: Get certificate by ID
 *     tags: [Certificates]
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
 *         description: Certificate retrieved successfully with PDF-ready data
 *       404:
 *         description: Certificate not found
 */
router.get('/:id',
  protect,
  authorizeRoles('admin', 'principal', 'clerk', 'student', 'parent'),
  [param('id').notEmpty().isMongoId(), handleValidation],
  getCertificate
);

/**
 * @swagger
 * /certificates/{id}/verify:
 *   post:
 *     summary: Verify a certificate (official verification)
 *     tags: [Certificates]
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
 *         description: Certificate verified successfully
 */
router.post('/:id/verify',
  protect,
  authorizeRoles('admin', 'principal'),
  [param('id').notEmpty().isMongoId(), handleValidation],
  verifyCertificate
);

/**
 * @swagger
 * /certificates/{id}/cancel:
 *   post:
 *     summary: Cancel a certificate
 *     tags: [Certificates]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificate cancelled successfully
 */
router.post('/:id/cancel',
  protect,
  authorizeRoles('admin', 'principal'),
  [
    param('id').notEmpty().isMongoId(),
    body('reason').notEmpty().trim().isLength({ min: 5, max: 500 }),
    handleValidation
  ],
  cancelCertificate
);

/**
 * @swagger
 * /certificates/{id}:
 *   delete:
 *     summary: Delete a certificate (soft delete)
 *     tags: [Certificates]
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
 *         description: Certificate deleted successfully
 *       404:
 *         description: Certificate not found
 */
router.delete('/:id',
  protect,
  authorizeRoles('admin'),
  [param('id').notEmpty().isMongoId(), handleValidation],
  deleteCertificate
);

module.exports = router;
