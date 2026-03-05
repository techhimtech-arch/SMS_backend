const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const School = require('../models/School');
const User = require('../models/User');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new school with admin
   */
  async registerSchool(registrationData) {
    const { schoolName, schoolEmail, adminName, adminEmail, adminPassword } = registrationData;

    // Check if school already exists
    const existingSchool = await School.findOne({ email: schoolEmail });
    if (existingSchool) {
      throw { status: 400, message: 'School already exists' };
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      throw { status: 400, message: 'Admin email already registered' };
    }

    // Create School
    const school = new School({ name: schoolName, email: schoolEmail });
    await school.save();

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

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
    const token = this.generateToken(adminUser, school._id);

    // Send welcome email (async)
    emailService.sendWelcomeEmail(adminUser, school).catch(err => {
      logger.error('Failed to send welcome email', { error: err.message });
    });

    return { token, school, user: adminUser };
  }

  /**
   * Login user
   */
  async login(email, password) {
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    const token = this.generateToken(user, user.schoolId);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      }
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save to user (you'd need to add these fields to User model)
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    return { message: 'If email exists, reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
      isActive: true
    });

    if (!user) {
      throw { status: 400, message: 'Invalid or expired reset token' };
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

  /**
   * Generate JWT token
   */
  generateToken(user, schoolId) {
    return jwt.sign(
      { 
        userId: user._id, 
        schoolId, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

module.exports = new AuthService();
