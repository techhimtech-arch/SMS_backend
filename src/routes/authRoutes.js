const express = require('express');
const { registerSchool, login } = require('../controllers/authController');
const router = express.Router();

// Register School Route
router.post('/register', registerSchool);

// Login Route
router.post('/login', login);

module.exports = router;