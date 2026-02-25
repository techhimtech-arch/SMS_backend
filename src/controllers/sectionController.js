const Section = require('../models/Section');
const Class = require('../models/Class');
const asyncHandler = require('express-async-handler');

// Create a new section
const createSection = asyncHandler(async (req, res) => {
  const { name, classId, classTeacher } = req.body;

  // Validate classId belongs to the same school
  const classData = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
  if (!classData) {
    return res.status(400).json({ success: false, message: 'Invalid classId or unauthorized' });
  }

  // Create section
  const section = await Section.create({
    name,
    classId,
    classTeacher,
    schoolId: req.user.schoolId,
  });

  res.status(201).json({
    success: true,
    message: 'Section created successfully',
    data: section,
  });
});

// Get all active sections of the logged-in school
const getSections = asyncHandler(async (req, res) => {
  const sections = await Section.find({ schoolId: req.user.schoolId, isActive: true })
    .populate('classId', 'name')
    .populate('classTeacher', 'name email');

  res.status(200).json({ success: true, data: sections });
});

// Get sections for a specific class
const getSectionsByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  // Validate class belongs to the same school
  const classData = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
  if (!classData) {
    return res.status(400).json({ success: false, message: 'Invalid classId or unauthorized' });
  }

  const sections = await Section.find({ schoolId: req.user.schoolId, classId })
    .populate('classId', 'name')
    .populate('classTeacher', 'name email');

  res.status(200).json({ success: true, data: sections });
});

// Update a section
const updateSection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, classTeacher } = req.body;

  const section = await Section.findOneAndUpdate(
    { _id: id, schoolId: req.user.schoolId },
    { name, classTeacher },
    { new: true }
  );

  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found or unauthorized' });
  }

  res.status(200).json({ success: true, data: section });
});

// Soft delete a section
const deleteSection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const section = await Section.findOneAndUpdate(
    { _id: id, schoolId: req.user.schoolId },
    { isActive: false },
    { new: true }
  );

  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found or unauthorized' });
  }

  res.status(200).json({ success: true, message: 'Section deleted successfully' });
});

module.exports = {
  createSection,
  getSections,
  getSectionsByClass,
  updateSection,
  deleteSection,
};