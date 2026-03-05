const authService = require('../services/authService');
const logger = require('../utils/logger');

// Register School
const registerSchool = async (req, res) => {
  try {
    const result = await authService.registerSchool(req.body);

    res.status(201).json({
      success: true,
      message: 'School registered successfully',
      data: { token: result.token }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// Request Password Reset
const requestPasswordReset = async (req, res) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    logger.error('Password reset request error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

module.exports = { registerSchool, login, requestPasswordReset, resetPassword };