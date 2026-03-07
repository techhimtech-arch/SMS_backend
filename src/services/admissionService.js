const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const logger = require('../utils/logger');

/**
 * Complete student admission with transaction
 * Creates User + StudentProfile + Enrollment
 */
const admitStudent = async (admissionData, schoolId, adminId) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Step 1: Create User with student role
      const userData = {
        name: `${admissionData.firstName} ${admissionData.lastName}`,
        email: admissionData.email,
        password: admissionData.password || 'TempPassword123',
        role: 'student',
        schoolId: schoolId
      };

      // Make email optional if not provided
      if (!admissionData.email) {
        delete userData.email;
      }

      const user = await User.create([userData], { session });
      const userId = user[0]._id;

      // Step 2: Create Student Profile
      const profileData = {
        userId: userId,
        admissionNumber: admissionData.admissionNumber,
        firstName: admissionData.firstName,
        lastName: admissionData.lastName,
        gender: admissionData.gender,
        dateOfBirth: admissionData.dateOfBirth,
        parentUserId: admissionData.parentUserId,
        address: admissionData.address,
        bloodGroup: admissionData.bloodGroup,
        emergencyContact: admissionData.emergencyContact,
        schoolId: schoolId,
        createdBy: adminId
      };

      const studentProfile = await StudentProfile.create([profileData], { session });
      const studentId = studentProfile[0]._id;

      // Step 3: Create Enrollment
      const enrollmentData = {
        studentId: studentId,
        academicYearId: admissionData.academicYearId,
        classId: admissionData.classId,
        sectionId: admissionData.sectionId,
        rollNumber: admissionData.rollNumber,
        status: 'enrolled',
        schoolId: schoolId,
        admissionDate: new Date(),
        createdBy: adminId
      };

      await Enrollment.create([enrollmentData], { session });

      logger.info('Student admitted successfully', {
        studentId,
        userId,
        admissionNumber: admissionData.admissionNumber,
        schoolId
      });
    });

    return {
      success: true,
      message: 'Student admitted successfully',
      statusCode: 201
    };

  } catch (error) {
    logger.error('Student admission failed', {
      error: error.message,
      admissionNumber: admissionData.admissionNumber,
      schoolId
    });
    
    // Handle duplicate errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return {
        success: false,
        message: `Duplicate ${field}. Please check the admission number or email.`,
        statusCode: 409
      };
    }

    return {
      success: false,
      message: 'Admission failed. Please try again.',
      statusCode: 500,
      error: error.message
    };
  } finally {
    await session.endSession();
  }
};

/**
 * Get student admission details
 */
const getAdmissionDetails = async (studentId, schoolId) => {
  try {
    const studentProfile = await StudentProfile.findOne({ 
      _id: studentId, 
      schoolId,
      isActive: true 
    })
      .populate('userId', 'name email role')
      .populate('parentUserId', 'name email phone')
      .populate('currentEnrollment');

    if (!studentProfile) {
      return {
        success: false,
        message: 'Student not found',
        statusCode: 404
      };
    }

    return {
      success: true,
      data: studentProfile,
      statusCode: 200
    };

  } catch (error) {
    logger.error('Failed to get admission details', {
      error: error.message,
      studentId,
      schoolId
    });

    return {
      success: false,
      message: 'Failed to get admission details',
      statusCode: 500,
      error: error.message
    };
  }
};

module.exports = {
  admitStudent,
  getAdmissionDetails
};
