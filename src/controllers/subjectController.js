const Subject = require('../models/Subject');
const Class = require('../models/Class');
const TeacherAssignment = require('../models/TeacherAssignment');
const ClassTeacherAssignment = require('../models/ClassTeacherAssignment');

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const { name, classId } = req.body;
    const schoolId = req.user.schoolId;

    // Check if class exists and belongs to the school
    const classExists = await Class.findOne({ _id: classId, schoolId, isActive: true });
    if (!classExists) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Check if subject already exists for this class
    const existingSubject = await Subject.findOne({ name, classId, schoolId, isActive: true });
    if (existingSubject) {
      return res.status(400).json({ success: false, message: 'Subject already exists for this class' });
    }

    const subject = new Subject({ name, classId, schoolId });
    await subject.save();

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all subjects based on user role
const getSubjects = async (req, res) => {
  try {
    const { role } = req.user;
    const schoolId = req.user.schoolId;
    let subjects;

    switch (role) {
      case 'school_admin':
        // Admin sees all subjects for the school
        subjects = await Subject.find({ schoolId, isActive: true })
          .populate('classId', 'name')
          .sort({ classId: 1, name: 1 });
        break;

      case 'teacher':
        // Teacher sees only subjects for their assigned classes
        const teacherAssignments = await TeacherAssignment.find({ 
          teacherId: req.user._id, 
          schoolId, 
          isActive: true 
        }).distinct('classId');
        
        const classTeacherAssignments = await ClassTeacherAssignment.find({ 
          teacherId: req.user._id, 
          schoolId, 
          isActive: true 
        }).distinct('classId');

        // Combine both types of assignments
        const assignedClassIds = [...new Set([...teacherAssignments, ...classTeacherAssignments])];
        
        if (assignedClassIds.length === 0) {
          return res.status(200).json({
            success: true,
            count: 0,
            data: [],
            message: 'No classes assigned to this teacher'
          });
        }

        subjects = await Subject.find({ 
          classId: { $in: assignedClassIds }, 
          schoolId, 
          isActive: true 
        })
          .populate('classId', 'name')
          .sort({ classId: 1, name: 1 });
        break;

      case 'accountant':
        // Accountant sees subjects with fee-related info (if needed in future)
        // For now, same as admin but can be customized
        subjects = await Subject.find({ schoolId, isActive: true })
          .populate('classId', 'name')
          .sort({ classId: 1, name: 1 });
        break;

      default:
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: Your role is not authorized to view subjects'
        });
    }

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
      role: role, // Include role info for frontend reference
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get subjects by classId
const getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const schoolId = req.user.schoolId;

    const subjects = await Subject.find({ classId, schoolId, isActive: true })
      .populate('classId', 'name')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const schoolId = req.user.schoolId;

    const subject = await Subject.findOne({ _id: id, schoolId, isActive: true });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check if new name conflicts with existing subject
    if (name && name !== subject.name) {
      const existingSubject = await Subject.findOne({
        name,
        classId: subject.classId,
        schoolId,
        isActive: true,
        _id: { $ne: id },
      });
      if (existingSubject) {
        return res.status(400).json({ success: false, message: 'Subject with this name already exists for this class' });
      }
      subject.name = name;
    }

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Soft delete a subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const subject = await Subject.findOne({ _id: id, schoolId, isActive: true });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject.isActive = false;
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectsByClass,
  updateSubject,
  deleteSubject,
};
