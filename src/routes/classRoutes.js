const express = require('express');
const {
  createClass,
  getClasses,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');

const router = express.Router();

// Create a new class
router.post('/', authMiddleware, authorizeRoles('school_admin'), createClass);

// Get all classes for the logged-in user's school
router.get('/', authMiddleware, authorizeRoles('school_admin'), getClasses);

// Update class name
router.patch('/:id', authMiddleware, authorizeRoles('school_admin'), updateClass);

// Soft delete a class
router.delete('/:id', authMiddleware, authorizeRoles('school_admin'), deleteClass);

module.exports = router;