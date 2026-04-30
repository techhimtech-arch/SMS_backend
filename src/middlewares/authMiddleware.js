const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AcademicYear = require('../models/AcademicYear');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
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

    // Attach current academic year context (if configured)
    // Many features (enrollment, teacher-subject assignments) are academic-year scoped.
    try {
      const currentYear = await AcademicYear.getCurrentYear(decoded.schoolId);
      if (currentYear) {
        req.user.academicYearId = currentYear._id;
        req.user.academicYearName = currentYear.name;
      } else {
        req.user.academicYearId = null;
        req.user.academicYearName = null;
      }
    } catch (err) {
      logger.warn('Failed to resolve current academic year', {
        requestId: req.requestId,
        schoolId: decoded.schoolId,
        error: err?.message
      });
      req.user.academicYearId = null;
      req.user.academicYearName = null;
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
};

// Export with both names for compatibility with different import styles
module.exports = protect;
module.exports.protect = protect;
module.exports.authMiddleware = protect;