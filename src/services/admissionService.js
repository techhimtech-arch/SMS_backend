const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const logger = require('../utils/logger');

/**
 * Complete student admission with transaction
 * Creates User + StudentProfile + Enrollment (if class data provided)
 */
const admitStudent = async (admissionData, schoolId, adminId) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Step 1: Create User with student role
      const userData = {
        name: `${admissionData.firstName} ${admissionData.lastName}`,
        role: 'student',
        schoolId: schoolId
      };

      // Add email only if provided, otherwise use dummy email
      if (admissionData.email) {
        userData.email = admissionData.email;
      } else {
        // Generate dummy email to satisfy required constraint
        userData.email = `student_${admissionData.admissionNumber}@noemail.local`;
      }

      // Add password only if provided
      if (admissionData.password) {
        userData.password = admissionData.password;
      } else {
        userData.password = 'TempPassword123';
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
        schoolId: schoolId,
        createdBy: adminId
      };

      // Add optional fields if provided
      if (admissionData.parentUserId) profileData.parentUserId = admissionData.parentUserId;
      if (admissionData.address) profileData.address = admissionData.address;
      if (admissionData.bloodGroup) profileData.bloodGroup = admissionData.bloodGroup;
      if (admissionData.emergencyContact) profileData.emergencyContact = admissionData.emergencyContact;

      const studentProfile = await StudentProfile.create([profileData], { session });
      const studentId = studentProfile[0]._id;

      // Step 3: Create Enrollment ONLY if all academic data provided
      if (admissionData.academicYearId && admissionData.classId && admissionData.sectionId) {
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
      }
      // If no class data, student is admitted but not enrolled yet

      logger.info('Student admitted successfully', {
        studentId,
        userId,
        admissionNumber: admissionData.admissionNumber,
        hasEnrollment: !!admissionData.classId,
        schoolId
      });
    });

    return {
      success: true,
      message: admissionData.classId 
        ? 'Student admitted and enrolled successfully'
        : 'Student admitted successfully. Assign class later.',
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

/**
 * Create partial admission (basic info only)
 */
const createPartialAdmission = async (admissionData, schoolId, adminId) => {
  try {
    // Create User with student role
    const userData = {
      name: `${admissionData.firstName} ${admissionData.lastName}`,
      role: 'student',
      schoolId: schoolId,
      email: admissionData.email || `student_${Date.now()}@partial.local`,
      password: 'TempPassword123'
    };

    const user = await User.create(userData);
    const userId = user._id;

    // Create Student Profile with partial status
    const profileData = {
      userId: userId,
      admissionNumber: admissionData.admissionNumber || `PARTIAL-${Date.now()}`,
      firstName: admissionData.firstName,
      lastName: admissionData.lastName,
      gender: admissionData.gender,
      dateOfBirth: admissionData.dateOfBirth,
      email: admissionData.email,
      phone: admissionData.phone,
      address: admissionData.address,
      emergencyContact: admissionData.emergencyContact,
      schoolId: schoolId,
      status: 'partial',
      admittedBy: adminId,
      admissionDate: new Date()
    };

    const profile = await StudentProfile.create(profileData);

    return {
      success: true,
      message: 'Partial admission created successfully. Parent details can be added later during completion.',
      data: {
        user,
        profile
      },
      statusCode: 201
    };

  } catch (error) {
    logger.error('Failed to create partial admission', {
      error: error.message,
      schoolId
    });

    return {
      success: false,
      message: 'Failed to create partial admission',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Complete partial admission
 */
const completeAdmission = async (studentId, updateData, schoolId, adminId) => {
  try {
    // Update student profile with complete details
    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { 
        _id: studentId,
        schoolId: schoolId,
        status: 'partial' // Only update partial admissions
      },
      {
        ...updateData,
        status: 'completed',
        completedAt: new Date(),
        completedBy: adminId
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!updatedProfile) {
      return {
        success: false,
        message: 'Partial admission not found or already completed',
        statusCode: 404
      };
    }

    // Create enrollment if class and section provided
    if (updateData.classId && updateData.sectionId) {
      const enrollmentData = {
        studentId: studentId,
        classId: updateData.classId,
        sectionId: updateData.sectionId,
        rollNumber: updateData.rollNumber,
        academicYearId: updateData.academicYearId,
        schoolId: schoolId,
        enrollmentDate: new Date(),
        status: 'active'
      };

      await Enrollment.create(enrollmentData);
    }

    return {
      success: true,
      message: 'Admission completed successfully',
      data: updatedProfile,
      statusCode: 200
    };

  } catch (error) {
    logger.error('Failed to complete admission', {
      error: error.message,
      studentId,
      schoolId
    });

    return {
      success: false,
      message: 'Failed to complete admission',
      statusCode: 500,
      error: error.message
    };
  }
};

/**
 * Get partial admissions
 */
const getPartialAdmissions = async (schoolId, page = 1, limit = 10, search = '') => {
  try {
    const query = {
      schoolId: schoolId,
      status: 'partial'
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [admissions, total] = await Promise.all([
      StudentProfile.find(query)
        .populate('userId', 'name email')
        .populate('admittedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StudentProfile.countDocuments(query)
    ]);

    return {
      admissions,
      total
    };

  } catch (error) {
    logger.error('Failed to get partial admissions', {
      error: error.message,
      schoolId
    });

    return {
      success: false,
      message: 'Failed to get partial admissions',
      error: error.message
    };
  }
};

module.exports = {
  admitStudent,
  getAdmissionDetails,
  createPartialAdmission,
  completeAdmission,
  getPartialAdmissions
};
