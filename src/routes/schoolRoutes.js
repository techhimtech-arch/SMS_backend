const express = require('express');
const router = express.Router();
const { getMySchool, updateMySchool } = require('../controllers/schoolController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/me', getMySchool);
router.patch('/me', updateMySchool);

module.exports = router;
