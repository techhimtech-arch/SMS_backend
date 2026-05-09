const asyncHandler = require('express-async-handler');
const ParentStudentMapping = require('../models/ParentStudentMapping');
const User = require('../models/User');
const Student = require('../models/StudentProfile');

/**
 * Link a parent to a student (creates/updates ParentStudentMapping)
 */
exports.linkParentToStudent = asyncHandler(async (req, res) => {
  const { studentId, parentId } = req.params;
  const { relationship = 'GUARDIAN', isPrimary = false, isEmergencyContact = true, canPickup = true } = req.body;
  const schoolId = req.user.schoolId;

  // Verify parent exists and has parent role
  const parent = await User.findById(parentId);
  if (!parent || parent.role !== 'parent') {
    return res.status(404).json({ 
      success: false, 
      message: 'Parent not found or does not have parent role' 
    });
  }

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Check if mapping already exists (including deleted ones)
  let mapping = await ParentStudentMapping.findOne({
    parentId,
    schoolId
  }).setOptions({ includeDeleted: true });

  if (mapping) {
    // If it was soft-deleted, restore it
    if (mapping.isDeleted) {
      mapping.isDeleted = false;
      mapping.deletedAt = undefined;
      mapping.deletedBy = undefined;
      mapping.studentIds = []; // Clear old students if starting fresh or keep them? 
      // Usually, we want to keep it clean if it was deleted, but here we add the new student below
    }
    
    // Add student to existing mapping
    await mapping.addStudent(studentId);
  } else {
    // Create new mapping
    mapping = await ParentStudentMapping.create({
      parentId,
      studentIds: [studentId],
      relationship,
      isPrimary,
      isEmergencyContact,
      canPickup,
      schoolId,
      createdBy: req.user.id
    });
  }

  // Populate for response
  mapping = await ParentStudentMapping.findById(mapping._id)
    .populate('parentId', 'name email phone')
    .populate({
      path: 'studentIds',
      populate: {
        path: 'currentEnrollment',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' }
        ]
      }
    });

  res.status(200).json({
    success: true,
    message: 'Parent linked to student successfully',
    data: mapping
  });
});

/**
 * Unlink a parent from a student
 */
exports.unlinkParentFromStudent = asyncHandler(async (req, res) => {
  const { studentId, parentId } = req.params;
  const schoolId = req.user.schoolId;

  const mapping = await ParentStudentMapping.findOne({
    parentId,
    studentIds: studentId,
    schoolId,
    isDeleted: { $ne: true }
  });

  if (!mapping) {
    return res.status(404).json({ 
      success: false, 
      message: 'Parent-student link not found' 
    });
  }

  // Remove student from mapping
  await mapping.removeStudent(studentId);

  // If mapping is now empty (soft deleted), indicate that
  const updatedMapping = await ParentStudentMapping.findById(mapping._id);

  res.status(200).json({
    success: true,
    message: 'Parent unlinked from student successfully',
    data: updatedMapping
  });
});

/**
 * Get all students linked to a parent
 */
exports.getLinkedStudents = asyncHandler(async (req, res) => {
  const { parentId } = req.params;
  const { userId: requestingUserId, role, schoolId } = req.user;

  // Verify requesting user is either the parent or an admin
  if (role === 'parent' && requestingUserId !== parentId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  // Verify parent exists
  const parent = await User.findById(parentId);
  if (!parent || parent.role !== 'parent') {
    return res.status(404).json({ success: false, message: 'Parent not found' });
  }

  // Get students for parent using the built-in static method
  const linkedStudents = await ParentStudentMapping.getStudentsForParent(parentId);

  res.status(200).json({
    success: true,
    data: {
      parentId,
      parentName: parent.name,
      linkedStudents,
      count: linkedStudents.length
    }
  });
});

/**
 * Get all parents linked to a student
 */
exports.getStudentLinkedParents = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const schoolId = req.user.schoolId;

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Find all parent mappings that include this student
  const mappings = await ParentStudentMapping.findByStudent(studentId);

  res.status(200).json({
    success: true,
    data: {
      studentId,
      studentName: student.name,
      linkedParents: mappings,
      count: mappings.length
    }
  });
});
