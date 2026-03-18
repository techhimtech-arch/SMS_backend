const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { validations, commonValidations, handleValidationErrors, body } = require('../middlewares/validationMiddleware');
const { softDelete } = require('../utils/softDelete');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Create new user
 * @route    POST /api/v1/users
 * @access   Private/School Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, schoolId } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create name from firstName and lastName
    const name = `${firstName} ${lastName}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      schoolId: schoolId || req.user.schoolId,
      createdBy: req.user._id
    });

    // Remove password from response
    user.password = undefined;

    logger.info('User created successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });

  } catch (error) {
    logger.error('Failed to create user', {
      error: error.message,
      email,
      role,
      schoolId: schoolId || req.user.schoolId,
      createdBy: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

/**
 * @desc    Get all users (with pagination and filtering)
 * @route    GET /api/v1/users
 * @access   Private/School Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, schoolId } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {
      schoolId: schoolId || req.user.schoolId
    };

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Failed to get users', {
      error: error.message,
      schoolId: req.user.schoolId,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

/**
 * @desc    Get user by ID
 * @route    GET /api/v1/users/:id
 * @access   Private/School Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('schoolId', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to the same school
    if (user.schoolId._id.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Failed to get user by ID', {
      error: error.message,
      userId: req.params.id,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
});

/**
 * @desc    Update user
 * @route    PUT /api/v1/users/:id
 * @access   Private/School Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to the same school
    if (user.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }

    // Update user fields
    const allowedUpdates = ['name', 'email', 'role'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle firstName and lastName combination for name field
    if (req.body.firstName !== undefined || req.body.lastName !== undefined) {
      const currentUser = await User.findById(req.params.id);
      const currentName = currentUser.name || '';
      const nameParts = currentName.split(' ');
      
      const firstName = req.body.firstName !== undefined ? req.body.firstName : nameParts[0];
      const lastName = req.body.lastName !== undefined ? req.body.lastName : nameParts.slice(1).join(' ');
      
      updates.name = `${firstName} ${lastName}`.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    logger.info('User updated successfully', {
      userId: updatedUser._id,
      updatedFields: Object.keys(updates),
      updatedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    logger.error('Failed to update user', {
      error: error.message,
      userId: req.params.id,
      schoolId: req.user.schoolId,
      updatedBy: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

/**
 * @desc    Soft delete user
 * @route    DELETE /api/v1/users/:id
 * @access   Private/School Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to the same school
    if (user.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent deletion of current user
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete the user
    await softDelete(user, req.user._id);

    logger.info('User soft deleted successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      deletedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete user', {
      error: error.message,
      userId: req.params.id,
      schoolId: req.user.schoolId,
      deletedBy: req.user._id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

/**
 * @desc    Get user statistics
 * @route    GET /api/v1/users/stats
 * @access   Private/School Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const stats = await User.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: '$count' },
          roleBreakdown: {
            $push: {
              role: '$_id',
              count: '$count'
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalUsers: 0,
      roleBreakdown: []
    };

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Failed to get user statistics', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
});

// ===========================================
// PROFILE MANAGEMENT FUNCTIONS
// ===========================================

/**
 * @desc    Get current user profile
 * @route    GET /api/v1/users/me
 * @access   Private
 */
const getMyProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('schoolId', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });

  } catch (error) {
    logger.error('Failed to get user profile', {
      error: error.message,
      userId: req.user.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

/**
 * @desc    Update current user profile
 * @route    PATCH /api/v1/users/me
 * @access   Private
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: user._id }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }

    // Update user fields
    const allowedUpdates = ['name', 'email', 'phone', 'address'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    logger.info('User profile updated successfully', {
      userId: updatedUser._id,
      updatedFields: Object.keys(updates)
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    logger.error('Failed to update user profile', {
      error: error.message,
      userId: req.user.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * @desc    Change current user password
 * @route    PATCH /api/v1/users/change-password
 * @access   Private
 */
const changeMyPassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(req.user.userId, {
      password: hashedNewPassword
    });

    logger.info('User password changed successfully', {
      userId: user._id
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Failed to change password', {
      error: error.message,
      userId: req.user.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

/**
 * @desc    Upload profile image
 * @route    POST /api/v1/users/profile-image
 * @access   Private
 */
const uploadProfileImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '..', 'public', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new profile image path
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user.userId, {
      profileImage: imageUrl
    });

    logger.info('Profile image uploaded successfully', {
      userId: user._id,
      imageUrl
    });

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl
      }
    });

  } catch (error) {
    logger.error('Failed to upload profile image', {
      error: error.message,
      userId: req.user.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
});

module.exports = {
  createUser: [validations.createUser, handleValidationErrors, createUser],
  getUsers: [validations.pagination, handleValidationErrors, getUsers],
  getUserById: [commonValidations.objectId('id'), handleValidationErrors, getUserById],
  updateUser: [
    commonValidations.objectId('id'),
    validations.updateUser,
    handleValidationErrors,
    updateUser
  ],
  deleteUser: [commonValidations.objectId('id'), handleValidationErrors, deleteUser],
  getUserStats,
  getMyProfile,
  updateMyProfile: [
    // Add validation for profile update
    commonValidations.name('name', 2, 100).optional(),
    commonValidations.email().optional(),
    commonValidations.phone('phone').optional(),
    handleValidationErrors,
    updateMyProfile
  ],
  changeMyPassword: [
    // Add validation for password change
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password('newPassword'),
    handleValidationErrors,
    changeMyPassword
  ],
  uploadProfileImage
};
