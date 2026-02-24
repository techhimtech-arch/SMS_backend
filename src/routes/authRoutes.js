const express = require('express');
const { registerSchool, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const User = require('../models/User');

// Register School Route
router.post('/register', registerSchool);

// Login Route
router.post('/login', login);

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