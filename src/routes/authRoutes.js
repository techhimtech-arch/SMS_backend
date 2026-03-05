const express = require('express');
const { registerSchool, login, requestPasswordReset, resetPassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization routes
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new school with admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolName
 *               - schoolEmail
 *               - adminName
 *               - adminEmail
 *               - adminPassword
 *             properties:
 *               schoolName:
 *                 type: string
 *                 description: Name of the school
 *                 example: Delhi Public School
 *               schoolEmail:
 *                 type: string
 *                 description: School's official email
 *                 example: contact@dps.edu
 *               adminName:
 *                 type: string
 *                 description: Name of the school admin
 *                 example: John Doe
 *               adminEmail:
 *                 type: string
 *                 description: Admin's login email
 *                 example: admin@dps.edu
 *               adminPassword:
 *                 type: string
 *                 description: Admin's password (min 6 characters)
 *                 example: password123
 *     responses:
 *       201:
 *         description: School registered successfully
 *       400:
 *         description: School already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */

// Register School Route
router.post('/register', validateRegister, registerSchool);

// Login Route
router.post('/login', validateLogin, login);

// Protected Test Route
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;