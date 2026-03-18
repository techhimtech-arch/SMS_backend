const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Section = require('../models/Section');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/response');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @desc    Assign roll numbers to students in bulk
 * @route    POST /api/v1/roll-numbers/bulk-assign
 * @access   Private/School Admin
 */
const bulkAssignRollNumbers = asyncHandler(async (req, res) => {
  try {
    const { 
      enrollments, 
      startFrom = 1, 
      prefix = '', 
      academicSessionId 
    } = req.body;

    if (!Array.isArray(enrollments) || enrollments.length === 0) {
      return sendError(res, 400, 'Enrollments array is required');
    }

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Group enrollments by class and section
    const enrollmentsByClassSection = {};
    enrollments.forEach(enrollment => {
      const key = `${enrollment.classId}_${enrollment.sectionId}`;
      if (!enrollmentsByClassSection[key]) {
        enrollmentsByClassSection[key] = [];
      }
      enrollmentsByClassSection[key].push(enrollment);
    });

    const results = [];
    let rollNumberCounter = startFrom;

    // Process each class-section group
    for (const [classSectionKey, groupEnrollments] of Object.entries(enrollmentsByClassSection)) {
      const [classId, sectionId] = classSectionKey.split('_');
      
      // Sort students by name for consistent roll number assignment
      groupEnrollments.sort((a, b) => {
        const studentA = a.studentId;
        const studentB = b.studentId;
        return studentA.localeCompare(studentB);
      });

      // Assign roll numbers
      for (const enrollment of groupEnrollments) {
        const rollNumber = prefix + rollNumberCounter.toString().padStart(3, '0');
        
        // Check if roll number already exists in this class-section-session
        const existingEnrollment = await Enrollment.checkRollNumberUniqueness(
          rollNumber,
          classId,
          sectionId,
          academicSessionId,
          req.user.schoolId
        );

        if (existingEnrollment) {
          results.push({
            enrollmentId: enrollment.enrollmentId,
            success: false,
            error: `Roll number ${rollNumber} already exists`,
            assignedRollNumber: null
          });
          rollNumberCounter++;
          continue;
        }

        // Update enrollment with roll number
        await Enrollment.findByIdAndUpdate(enrollment.enrollmentId, {
          rollNumber,
          updatedBy: req.user.userId
        });

        results.push({
          enrollmentId: enrollment.enrollmentId,
          success: true,
          assignedRollNumber: rollNumber,
          studentId: enrollment.studentId
        });

        rollNumberCounter++;
      }
    }

    logger.info('Bulk roll number assignment completed', {
      totalProcessed: enrollments.length,
      academicSessionId,
      assignedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Roll numbers assigned successfully', {
      results,
      summary: {
        totalProcessed: enrollments.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    logger.error('Failed to bulk assign roll numbers', {
      error: error.message,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to assign roll numbers');
  }
});

/**
 * @desc    Reassign roll numbers for a class-section
 * @route    POST /api/v1/roll-numbers/reassign
 * @access   Private/School Admin
 */
const reassignRollNumbers = asyncHandler(async (req, res) => {
  try {
    const { 
      classId, 
      sectionId, 
      academicSessionId, 
      startFrom = 1, 
      prefix = '',
      preserveExisting = false 
    } = req.body;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Get all enrollments for this class-section-session
    const enrollments = await Enrollment.find({
      classId,
      sectionId,
      academicSessionId,
      schoolId: req.user.schoolId,
      status: 'ENROLLED',
      isDeleted: { $ne: true }
    })
    .populate('studentId')
    .sort({ rollNumber: 1 });

    let rollNumberCounter = startFrom;
    const results = [];

    for (const enrollment of enrollments) {
      let newRollNumber;
      
      if (preserveExisting && enrollment.rollNumber) {
        // Keep existing roll number if preserving
        newRollNumber = enrollment.rollNumber;
        rollNumberCounter = Math.max(rollNumberCounter, parseInt(enrollment.rollNumber.replace(/^\D+/, '')) + 1);
      } else {
        // Assign new roll number
        newRollNumber = prefix + rollNumberCounter.toString().padStart(3, '0');
        
        // Check for conflicts
        const conflictEnrollment = enrollments.find(e => 
          e.rollNumber === newRollNumber && e._id.toString() !== enrollment._id.toString()
        );

        if (conflictEnrollment) {
          results.push({
            enrollmentId: enrollment._id,
            success: false,
            error: `Roll number ${newRollNumber} conflicts with existing roll number`,
            oldRollNumber: enrollment.rollNumber,
            newRollNumber: null
          });
          rollNumberCounter++;
          continue;
        }
      }

      // Update enrollment
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        rollNumber: newRollNumber,
        updatedBy: req.user.userId
      });

      results.push({
        enrollmentId: enrollment._id,
        success: true,
        oldRollNumber: enrollment.rollNumber,
        newRollNumber,
        studentId: enrollment.studentId._id,
        studentName: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`
      });

      if (!preserveExisting) {
        rollNumberCounter++;
      }
    }

    logger.info('Roll numbers reassigned successfully', {
      classId,
      sectionId,
      academicSessionId,
      totalProcessed: enrollments.length,
      reassignedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Roll numbers reassigned successfully', {
      results,
      summary: {
        classId,
        sectionId,
        academicSessionId,
        totalProcessed: enrollments.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    logger.error('Failed to reassign roll numbers', {
      error: error.message,
      classId: req.body.classId,
      sectionId: req.body.sectionId,
      academicSessionId: req.body.academicSessionId,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to reassign roll numbers');
  }
});

/**
 * @desc    Get roll number assignments for a class-section
 * @route    GET /api/v1/roll-numbers/class/:classId/section/:sectionId
 * @access   Private/School Admin, Teacher
 */
const getRollNumberAssignments = asyncHandler(async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { academicSessionId, search } = req.query;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Validate section belongs to class
    const section = await Section.findOne({
      _id: sectionId,
      classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!section) {
      return sendError(res, 404, 'Section not found or does not belong to this class');
    }

    // Build filter
    let filter = {
      classId,
      sectionId,
      academicSessionId,
      schoolId: req.user.schoolId,
      status: 'ENROLLED',
      isDeleted: { $ne: true }
    };

    if (search) {
      filter = {
        ...filter,
        $or: [
          { 'rollNumber': { $regex: search, $options: 'i' } },
          { 'studentId.firstName': { $regex: search, $options: 'i' } },
          { 'studentId.lastName': { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get enrollments with roll numbers
    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'admissionNumber firstName lastName')
      .sort({ rollNumber: 1 });

    return sendSuccess(res, 200, 'Roll number assignments retrieved successfully', enrollments);

  } catch (error) {
    logger.error('Failed to get roll number assignments', {
      error: error.message,
      classId: req.params.classId,
      sectionId: req.params.sectionId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get roll number assignments');
  }
});

/**
 * @desc    Auto-assign roll numbers for all classes in a session
 * @route    POST /api/v1/roll-numbers/auto-assign-session
 * @access   Private/School Admin
 */
const autoAssignSessionRollNumbers = asyncHandler(async (req, res) => {
  try {
    const { academicSessionId, prefix = '' } = req.body;

    if (!academicSessionId) {
      return sendError(res, 400, 'Academic session ID is required');
    }

    // Get all sections in this academic session
    const sections = await Section.find({
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    }).populate('classId');

    let totalProcessed = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;

    // Process each section
    for (const section of sections) {
      const enrollments = await Enrollment.find({
        classId: section.classId._id,
        sectionId: section._id,
        academicSessionId,
        schoolId: req.user.schoolId,
        status: 'ENROLLED',
        isDeleted: { $ne: true }
      })
      .populate('studentId')
      .sort({ studentId: 'firstName' }); // Sort by name for consistent numbering

      let rollNumberCounter = 1;

      for (const enrollment of enrollments) {
        const rollNumber = prefix + rollNumberCounter.toString().padStart(3, '0');
        
        try {
          await Enrollment.findByIdAndUpdate(enrollment._id, {
            rollNumber,
            updatedBy: req.user.userId
          });
          
          totalSuccessful++;
        } catch (error) {
          totalFailed++;
          logger.error('Failed to assign roll number', {
            enrollmentId: enrollment._id,
            error: error.message
          });
        }
        
        rollNumberCounter++;
        totalProcessed++;
      }
    }

    logger.info('Auto roll number assignment for session completed', {
      academicSessionId,
      totalSections: sections.length,
      totalProcessed,
      totalSuccessful,
      totalFailed,
      assignedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Auto roll number assignment completed', {
      academicSessionId,
      summary: {
        totalSections: sections.length,
        totalProcessed,
        totalSuccessful,
        totalFailed
      }
    });

  } catch (error) {
    logger.error('Failed to auto assign roll numbers for session', {
      error: error.message,
      academicSessionId: req.body.academicSessionId,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to auto assign roll numbers');
  }
});

/**
 * @desc    Validate roll number uniqueness
 * @route    POST /api/v1/roll-numbers/validate
 * @access   Private/School Admin
 */
const validateRollNumber = asyncHandler(async (req, res) => {
  try {
    const { rollNumber, classId, sectionId, academicSessionId, excludeId } = req.body;

    if (!rollNumber || !classId || !sectionId || !academicSessionId) {
      return sendError(res, 400, 'Roll number, class ID, section ID, and academic session ID are required');
    }

    // Check for existing roll number
    const existingEnrollment = await Enrollment.checkRollNumberUniqueness(
      rollNumber,
      classId,
      sectionId,
      academicSessionId,
      req.user.schoolId,
      excludeId
    );

    return sendSuccess(res, 200, 'Roll number validation completed', {
      rollNumber,
      classId,
      sectionId,
      academicSessionId,
      isAvailable: !existingEnrollment,
      existingEnrollmentId: existingEnrollment ? existingEnrollment._id : null
    });

  } catch (error) {
    logger.error('Failed to validate roll number', {
      error: error.message,
      rollNumber: req.body.rollNumber,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to validate roll number');
  }
});

module.exports = {
  bulkAssignRollNumbers: [
    authorizePermissions([PERMISSIONS.STUDENT_UPDATE]),
    bulkAssignRollNumbers
  ],
  reassignRollNumbers: [
    authorizePermissions([PERMISSIONS.STUDENT_UPDATE]),
    reassignRollNumbers
  ],
  getRollNumberAssignments: [
    authorizePermissions([PERMISSIONS.STUDENT_READ]),
    getRollNumberAssignments
  ],
  autoAssignSessionRollNumbers: [
    authorizePermissions([PERMISSIONS.STUDENT_UPDATE]),
    autoAssignSessionRollNumbers
  ],
  validateRollNumber: [
    authorizePermissions([PERMISSIONS.STUDENT_READ]),
    validateRollNumber
  ]
};
