const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const School = require('../models/School');
const User = require('../models/User');

// Register School
const registerSchool = async (req, res) => {
  try {
    const { schoolName, schoolEmail, adminName, adminEmail, adminPassword } = req.body;

    // Check if school already exists
    const existingSchool = await School.findOne({ email: schoolEmail });
    if (existingSchool) {
      return res.status(400).json({ message: 'School already exists' });
    }

    // Create School
    const school = new School({ name: schoolName, email: schoolEmail });
    await school.save();

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Admin User
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'school_admin',
      schoolId: school._id,
    });
    await adminUser.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: adminUser._id, schoolId: school._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, schoolId: user.schoolId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerSchool, login };