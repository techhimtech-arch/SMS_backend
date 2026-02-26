const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose'); // Add this at the top

// Create a new student
const createStudent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { admissionNumber, firstName, lastName, gender, dateOfBirth, classId, sectionId, parentName, parentPhone, address } = req.body;

  if (!req.user || !req.user.schoolId) {
    console.error('req.user or schoolId is missing');
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing schoolId' });
  }

  try {
    // Ensure classId and sectionId belong to the same school
    // This logic assumes Class and Section models have a schoolId field

    const student = await Student.create({
      admissionNumber,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      classId,
      sectionId,
      parentName,
      parentPhone,
      address,
      schoolId: req.user.schoolId, // Assign schoolId from logged-in user
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error in createStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Fetch all students for the logged-in user's school
const getStudents = async (req, res) => {
  try {
    const { schoolId } = req.user; // Extract schoolId from the authenticated user

    console.log('Querying students with schoolId:', schoolId); // Debug log for schoolId

    // Convert schoolId to ObjectId using `new`
    const students = await Student.find({ schoolId: new mongoose.Types.ObjectId(schoolId) });

    console.log('Query result:', students); // Debug log for query result

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createStudent,
  getStudents,
};