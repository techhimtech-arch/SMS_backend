const asyncHandler = require('express-async-handler');
const Subject = require('../models/Subject');
const TeacherSubjectAssignment = require('../models/TeacherSubjectAssignment');
const Class = require('../models/Class');
const logger = require('../utils/logger');
const { sendSuccess, sendError, sendPaginatedResponse } = require('../utils/response');
const { getPaginatedResults, buildSearchFilter } = require('../utils/pagination');
const { authorizePermissions } = require('../middlewares/roleAuthorization');
const { PERMISSIONS } = require('../utils/rbac');

/**
 * @desc    Create new subject
 * @route    POST /api/v1/subjects
 * @access   Private/School Admin
 */
const createSubject = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      classId,
      department,
      academicSessionId,
      teacherIds = [],
      isOptional = false,
      status = 'ACTIVE',
      credits = 1,
      weeklyHours = 1,
      prerequisites = []
    } = req.body;

    // Validate class exists and belongs to school
    const classExists = await Class.findOne({
      _id: classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!classExists) {
      return sendError(res, 400, 'Invalid class ID or class not found');
    }

    // Check if subject code already exists in same class and session
    const existingSubject = await Subject.findOne({
      code: code.toUpperCase(),
      classId,
      academicSessionId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (existingSubject) {
      return sendError(res, 400, `Subject code '${code}' already exists in this class for this session`);
    }

    // Create subject
    const subject = await Subject.create({
      name: name.trim(),
      code: code.toUpperCase(),
      description: description?.trim(),
      classId,
      department,
      academicSessionId,
      teacherIds,
      isOptional,
      status,
      credits,
      weeklyHours,
      prerequisites,
      schoolId: req.user.schoolId,
      createdBy: req.user.userId
    });

    // Update subject with teacher assignments if provided
    if (teacherIds.length > 0) {
      const assignments = teacherIds.map(teacherId => ({
        teacherId,
        subjectId: subject._id,
        classId,
        sectionId: null, // Will be assigned later
        academicSessionId,
        schoolId: req.user.schoolId,
        createdBy: req.user.userId
      }));

      await TeacherSubjectAssignment.insertMany(assignments);
    }

    logger.info('Subject created successfully', {
      subjectId: subject._id,
      subjectCode: subject.code,
      classId,
      createdBy: req.user.userId
    });

    return sendSuccess(res, 201, 'Subject created successfully', subject);

  } catch (error) {
    logger.error('Failed to create subject', {
      error: error.message,
      userId: req.user.userId,
      schoolId: req.user.schoolId
    });

    return sendError(res, 500, 'Failed to create subject');
  }
});

/**
 * @desc    Get subjects by class
 * @route    GET /api/v1/subjects/class/:classId
 * @access   Private/School Admin, Teacher
 */
const getSubjectsByClass = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicSessionId, search, status, department } = req.query;

    // Build filter
    let filter = {
      classId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    };

    if (academicSessionId) {
      filter.academicSessionId = academicSessionId;
    }

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (department) {
      filter.department = department.toUpperCase();
    }

    // Add search filter
    if (search) {
      filter = buildSearchFilter(filter, search, ['name', 'code', 'description']);
    }

    // Get paginated results
    const { data, pagination } = await getPaginatedResults(
      Subject,
      filter,
      req.query,
      {
        sort: { name: 1 },
        populate: [
          { path: 'teacherIds', select: 'name email' },
          { path: 'classId', select: 'name' }
        ]
      }
    );

    return sendPaginatedResponse(res, 'Subjects retrieved successfully', data, pagination);

  } catch (error) {
    logger.error('Failed to get subjects by class', {
      error: error.message,
      classId: req.params.classId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get subjects');
  }
});

/**
 * @desc    Get subjects by teacher
 * @route    GET /api/v1/subjects/teacher/:teacherId
 * @access   Private/School Admin, Teacher (own subjects)
 */
const getSubjectsByTeacher = asyncHandler(async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicSessionId, search } = req.query;

    // Check authorization (teacher can only view own subjects)
    if (req.user.role === 'teacher' && teacherId !== req.user.userId) {
      return sendError(res, 403, 'You can only view your own subjects');
    }

    // Build filter
    let filter = {
      teacherIds: teacherId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    };

    if (academicSessionId) {
      filter.academicSessionId = academicSessionId;
    }

    // Add search filter
    if (search) {
      filter = buildSearchFilter(filter, search, ['name', 'code', 'description']);
    }

    // Get paginated results
    const { data, pagination } = await getPaginatedResults(
      Subject,
      filter,
      req.query,
      {
        sort: { name: 1 },
        populate: [
          { path: 'classId', select: 'name' }
        ]
      }
    );

    return sendPaginatedResponse(res, 'Teacher subjects retrieved successfully', data, pagination);

  } catch (error) {
    logger.error('Failed to get subjects by teacher', {
      error: error.message,
      teacherId: req.params.teacherId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get subjects');
  }
});

/**
 * @desc    Update subject
 * @route    PUT /api/v1/subjects/:id
 * @access   Private/School Admin
 */
const updateSubject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subject = await Subject.findOne({
      _id: id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!subject) {
      return sendError(res, 404, 'Subject not found');
    }

    // Check if code is being changed and if it conflicts
    if (updateData.code && updateData.code !== subject.code) {
      const existingSubject = await Subject.findOne({
        code: updateData.code.toUpperCase(),
        classId: subject.classId,
        academicSessionId: subject.academicSessionId,
        schoolId: req.user.schoolId,
        _id: { $ne: id },
        isDeleted: { $ne: true }
      });

      if (existingSubject) {
        return sendError(res, 400, `Subject code '${updateData.code}' already exists in this class for this session`);
      }
    }

    // Prepare update data
    const allowedUpdates = [
      'name', 'code', 'description', 'department', 'isOptional', 
      'status', 'credits', 'weeklyHours', 'prerequisites'
    ];

    const updateObj = { updatedBy: req.user.userId };
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'code') {
          updateObj[field] = updateData[field].toUpperCase();
        } else {
          updateObj[field] = updateData[field];
        }
      }
    });

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      updateObj,
      { new: true, runValidators: true }
    );

    // Update teacher assignments if provided
    if (updateData.teacherIds && Array.isArray(updateData.teacherIds)) {
      // Remove existing assignments
      await TeacherSubjectAssignment.deleteMany({
        subjectId: id,
        schoolId: req.user.schoolId
      });

      // Create new assignments
      if (updateData.teacherIds.length > 0) {
        const assignments = updateData.teacherIds.map(teacherId => ({
          teacherId,
          subjectId: id,
          classId: subject.classId,
          sectionId: null,
          academicSessionId: subject.academicSessionId,
          schoolId: req.user.schoolId,
          createdBy: req.user.userId
        }));

        await TeacherSubjectAssignment.insertMany(assignments);
      }
    }

    logger.info('Subject updated successfully', {
      subjectId: id,
      updatedFields: Object.keys(updateObj),
      updatedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Subject updated successfully', updatedSubject);

  } catch (error) {
    logger.error('Failed to update subject', {
      error: error.message,
      subjectId: req.params.id,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to update subject');
  }
});

/**
 * @desc    Delete subject (soft delete)
 * @route    DELETE /api/v1/subjects/:id
 * @access   Private/School Admin
 */
const deleteSubject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findOne({
      _id: id,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!subject) {
      return sendError(res, 404, 'Subject not found');
    }

    // Soft delete subject
    subject.isDeleted = true;
    subject.deletedAt = new Date();
    subject.deletedBy = req.user.userId;
    await subject.save();

    // Remove related teacher assignments
    await TeacherSubjectAssignment.updateMany(
      { subjectId: id, schoolId: req.user.schoolId },
      { 
        isActive: false,
        updatedBy: req.user.userId
      }
    );

    logger.info('Subject deleted successfully', {
      subjectId: id,
      deletedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Subject deleted successfully');

  } catch (error) {
    logger.error('Failed to delete subject', {
      error: error.message,
      subjectId: req.params.id,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to delete subject');
  }
});

/**
 * @desc    Assign teacher to subject
 * @route    POST /api/v1/subjects/:subjectId/assign-teacher
 * @access   Private/School Admin
 */
const assignTeacherToSubject = asyncHandler(async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { teacherId, sectionId, role = 'PRIMARY_TEACHER' } = req.body;

    // Validate subject exists
    const subject = await Subject.findOne({
      _id: subjectId,
      schoolId: req.user.schoolId,
      isDeleted: { $ne: true }
    });

    if (!subject) {
      return sendError(res, 404, 'Subject not found');
    }

    // Check if assignment already exists
    const existingAssignment = await TeacherSubjectAssignment.findOne({
      teacherId,
      subjectId,
      classId: subject.classId,
      sectionId: sectionId || null,
      academicSessionId: subject.academicSessionId,
      schoolId: req.user.schoolId,
      isActive: true,
      isDeleted: { $ne: true }
    });

    if (existingAssignment) {
      return sendError(res, 400, 'Teacher is already assigned to this subject');
    }

    // Create assignment
    const assignment = await TeacherSubjectAssignment.create({
      teacherId,
      subjectId,
      classId: subject.classId,
      sectionId,
      academicSessionId: subject.academicSessionId,
      role,
      schoolId: req.user.schoolId,
      createdBy: req.user.userId
    });

    // Add teacher to subject's teacherIds array
    await Subject.findByIdAndUpdate(
      subjectId,
      { 
        $addToSet: { teacherIds: teacherId },
        updatedBy: req.user.userId
      }
    );

    logger.info('Teacher assigned to subject successfully', {
      assignmentId: assignment._id,
      teacherId,
      subjectId,
      assignedBy: req.user.userId
    });

    return sendSuccess(res, 201, 'Teacher assigned to subject successfully', assignment);

  } catch (error) {
    logger.error('Failed to assign teacher to subject', {
      error: error.message,
      subjectId: req.params.subjectId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to assign teacher to subject');
  }
});

/**
 * @desc    Remove teacher assignment
 * @route    DELETE /api/v1/subjects/:subjectId/remove-teacher/:teacherId
 * @access   Private/School Admin
 */
const removeTeacherFromSubject = asyncHandler(async (req, res) => {
  try {
    const { subjectId, teacherId } = req.params;

    // Find and deactivate assignment
    const assignment = await TeacherSubjectAssignment.findOne({
      teacherId,
      subjectId,
      schoolId: req.user.schoolId,
      isActive: true,
      isDeleted: { $ne: true }
    });

    if (!assignment) {
      return sendError(res, 404, 'Assignment not found');
    }

    // Deactivate assignment
    assignment.isActive = false;
    assignment.updatedBy = req.user.userId;
    await assignment.save();

    // Remove teacher from subject's teacherIds array
    await Subject.findByIdAndUpdate(
      subjectId,
      { 
        $pull: { teacherIds: teacherId },
        updatedBy: req.user.userId
      }
    );

    logger.info('Teacher removed from subject successfully', {
      assignmentId: assignment._id,
      teacherId,
      subjectId,
      removedBy: req.user.userId
    });

    return sendSuccess(res, 200, 'Teacher removed from subject successfully');

  } catch (error) {
    logger.error('Failed to remove teacher from subject', {
      error: error.message,
      subjectId: req.params.subjectId,
      teacherId: req.params.teacherId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to remove teacher from subject');
  }
});

/**
 * @desc    Get optional subjects for a class
 * @route    GET /api/v1/subjects/optional/:classId
 * @access   Private/School Admin, Teacher
 */
const getOptionalSubjects = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicSessionId } = req.query;

    const subjects = await Subject.findOptionalSubjects(
      classId,
      academicSessionId,
      req.user.schoolId
    );

    return sendSuccess(res, 200, 'Optional subjects retrieved successfully', subjects);

  } catch (error) {
    logger.error('Failed to get optional subjects', {
      error: error.message,
      classId: req.params.classId,
      userId: req.user.userId
    });

    return sendError(res, 500, 'Failed to get optional subjects');
  }
});

module.exports = {
  createSubject: [
    authorizePermissions([PERMISSIONS.SUBJECT_CREATE]),
    createSubject
  ],
  getSubjectsByClass: [
    authorizePermissions([PERMISSIONS.SUBJECT_READ]),
    getSubjectsByClass
  ],
  getSubjectsByTeacher: [
    authorizePermissions([PERMISSIONS.SUBJECT_READ]),
    getSubjectsByTeacher
  ],
  updateSubject: [
    authorizePermissions([PERMISSIONS.SUBJECT_UPDATE]),
    updateSubject
  ],
  deleteSubject: [
    authorizePermissions([PERMISSIONS.SUBJECT_DELETE]),
    deleteSubject
  ],
  assignTeacherToSubject: [
    authorizePermissions([PERMISSIONS.SUBJECT_UPDATE]),
    assignTeacherToSubject
  ],
  removeTeacherFromSubject: [
    authorizePermissions([PERMISSIONS.SUBJECT_UPDATE]),
    removeTeacherFromSubject
  ],
  getOptionalSubjects: [
    authorizePermissions([PERMISSIONS.SUBJECT_READ]),
    getOptionalSubjects
  ]
};
