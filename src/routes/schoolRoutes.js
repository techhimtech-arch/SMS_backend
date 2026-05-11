const express = require('express');
const router = express.Router();
const { getMySchool, updateMySchool, getSchoolById } = require('../controllers/schoolController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

// Get current school (using token's schoolId)
router.get('/me', getMySchool);

// Update current school
router.patch('/me', updateMySchool);

// Get school by ID (for frontend using schoolId directly)
router.get('/:id', getSchoolById);

module.exports = router;
