const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.schoolId) {
      logger.warn('Missing schoolId in token payload', { requestId: req.requestId });
      return res.status(401).json({ success: false, message: 'Invalid token: Missing schoolId' });
    }

    // Optional: Verify user exists in the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Attach user info to req.user (merge decoded token with user data)
    req.user = {
      ...decoded,
      id: decoded.userId, // Add id field for compatibility
      name: user.name, // Use name from database
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
};

// Export with both names for compatibility with different import styles
module.exports = protect;
module.exports.protect = protect;
module.exports.authMiddleware = protect;