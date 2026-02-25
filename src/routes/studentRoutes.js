const express = require('express');
const { createStudent } = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management routes
 */

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Add a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admissionNumber:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               parentName:
 *                 type: string
 *               parentPhone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student added successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authMiddleware, // Ensure this middleware is applied
  [
    check('admissionNumber', 'Admission number is required').notEmpty(),
    check('firstName', 'First name is required').notEmpty(),
    check('classId', 'Class ID is required').notEmpty(),
    check('sectionId', 'Section ID is required').notEmpty(),
    check('parentPhone', 'Invalid phone number').optional().isMobilePhone(),
  ],
  createStudent
);

module.exports = router;