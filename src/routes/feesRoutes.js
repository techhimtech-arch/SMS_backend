const express = require('express');
const {
  createFeeStructure,
  assignFeeToStudent,
  recordFeePayment,
  getStudentFeeDetails,
} = require('../controllers/feesController');
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fees
 *   description: Fees management APIs
 */

/**
 * @swagger
 * /api/fees/structure:
 *   post:
 *     summary: Create class fee structure
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *               academicYear:
 *                 type: string
 *               tuitionFee:
 *                 type: number
 *               transportFee:
 *                 type: number
 *               examFee:
 *                 type: number
 *               otherCharges:
 *                 type: number
 *     responses:
 *       201:
 *         description: Fee structure created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/fees/assign/{studentId}:
 *   post:
 *     summary: Assign fee to a student
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
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
 *               academicYear:
 *                 type: string
 *               classId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fee assigned to student successfully
 *       404:
 *         description: Fee structure not found
 */

/**
 * @swagger
 * /api/fees/payment/{studentId}:
 *   post:
 *     summary: Record a fee payment
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
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
 *               amount:
 *                 type: number
 *               paymentMode:
 *                 type: string
 *                 enum: [Cash, UPI, Bank]
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       404:
 *         description: Student fee record not found
 */

/**
 * @swagger
 * /api/fees/student/{studentId}:
 *   get:
 *     summary: Get student fee details
 *     tags: [Fees]
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
 *         description: Student fee details retrieved successfully
 *       404:
 *         description: Student fee record not found
 */

// Apply authentication and authorization middleware
router.use(protect);
router.use(authorizeRoles('school_admin', 'accountant'));

// Routes
router.post('/structure', createFeeStructure);
router.post('/assign/:studentId', assignFeeToStudent);
router.post('/payment/:studentId', recordFeePayment);
router.get('/student/:studentId', getStudentFeeDetails);

module.exports = router;