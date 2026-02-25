const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Debugging log to verify token payload

    if (!decoded.schoolId) {
      console.error('Missing schoolId in token payload');
      return res.status(401).json({ success: false, message: 'Invalid token: Missing schoolId' });
    }

    // Check if schoolId is present
    console.log(decoded); // Check if schoolId is present

    // Attach user info to req.user
    req.user = decoded;

    // Optional: Verify user exists in the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
};

module.exports = authMiddleware;