const StudentProfile = require('../models/StudentProfile');

/**
 * Get all student IDs linked to a parent
 */
exports.getLinkedStudentIds = async (parentId) => {
  const students = await StudentProfile.find({ linkedParentIds: parentId })
    .select('_id');
  return students.map(s => s._id);
};

/**
 * Verify if a parent has access to a student
 */
exports.canParentAccessStudent = async (parentId, studentId) => {
  const student = await StudentProfile.findOne({
    _id: studentId,
    linkedParentIds: parentId
  });
  return !!student;
};

/**
 * Get linked students with full details
 */
exports.getLinkedStudentsWithDetails = async (parentId) => {
  return StudentProfile.find({ linkedParentIds: parentId })
    .populate('userId', 'name email')
    .populate('currentEnrollment.classId', 'name')
    .populate('currentEnrollment.sectionId', 'name');
};
