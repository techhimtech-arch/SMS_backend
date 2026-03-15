const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const admissionService = require('../services/admissionService');
const AcademicYear = require('../models/AcademicYear');
const logger = require('../utils/logger');

// Validation middleware for partial admission (basic info only)
const validatePartialAdmission = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 5 || age > 25) {
        throw new Error('Student age must be between 5 and 25 years');
      }
      return true;
    }),
  
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  
  body('emergencyContact')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid emergency contact number')
];

// Validation middleware for completing admission (partial to complete)
const validateCompleteAdmission = [
  body('classId')
    .notEmpty()
    .withMessage('Class is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('sectionId')
    .notEmpty()
    .withMessage('Section is required')
    .isMongoId()
    .withMessage('Invalid section ID'),
  
  body('admissionNumber')
    .trim()
    .notEmpty()
    .withMessage('Admission number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Admission number must be between 3 and 20 characters'),
  
  body('rollNumber')
    .optional()
    .isNumeric()
    .withMessage('Roll number must be numeric'),
  
  body('parentUserId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent user ID'),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group')
];

// Validation middleware for admission
const validateAdmission = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('admissionNumber')
    .trim()
    .notEmpty()
    .withMessage('Admission number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Admission number must be between 3 and 20 characters'),
  
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 5 || age > 25) {
        throw new Error('Student age must be between 5 and 25 years');
      }
      return true;
    }),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('academicYearId')
    .notEmpty()
    .withMessage('Academic year is required')
    .isMongoId()
    .withMessage('Invalid academic year ID'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('sectionId')
    .notEmpty()
    .withMessage('Section is required')
    .isMongoId()
    .withMessage('Invalid section ID'),
  
  body('rollNumber')
    .optional()
    .isNumeric()
    .withMessage('Roll number must be numeric'),
  
  body('parentUserId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent user ID'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  
  body('emergencyContact')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid emergency contact number')
];

// Partial admission - basic info only
const createPartialAdmission = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    emergencyContact
  } = req.body;

  try {
    // Create partial admission record
    const admissionData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      schoolId: req.user.schoolId,
      status: 'partial', // Mark as partial admission
      admittedBy: req.user._id,
      admissionDate: new Date()
    };

    const result = await admissionService.createPartialAdmission(
      admissionData,
      req.user.schoolId,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: 'Partial admission created successfully. Complete admission by adding class, section, and parent details.',
      data: result
    });

  } catch (error) {
    logger.error('Failed to create partial admission', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create partial admission'
    });
  }
});

// Complete admission - update partial admission
const completeAdmission = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { studentId } = req.params;
  const {
    classId,
    sectionId,
    parentUserId,
    rollNumber,
    bloodGroup,
    admissionNumber
  } = req.body;

  try {
    const updateData = {
      classId,
      sectionId,
      parentUserId,
      rollNumber,
      bloodGroup,
      admissionNumber,
      status: 'completed', // Mark as completed
      completedAt: new Date(),
      completedBy: req.user._id
    };

    const result = await admissionService.completeAdmission(
      studentId,
      updateData,
      req.user.schoolId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Admission completed successfully',
      data: result
    });

  } catch (error) {
    logger.error('Failed to complete admission', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to complete admission'
    });
  }
});

// Get partial admissions
const getPartialAdmissions = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = await admissionService.getPartialAdmissions(
      req.user.schoolId,
      page,
      limit,
      search
    );

    res.status(200).json({
      success: true,
      data: result.admissions,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });

  } catch (error) {
    logger.error('Failed to get partial admissions', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get partial admissions'
    });
  }
});

// Admit new student (complete flow)
const admitStudent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Get current academic year if not provided
  let academicYearId = req.body.academicYearId;
  if (!academicYearId) {
    const currentYear = await AcademicYear.findOne({
      schoolId: req.user.schoolId,
      isActive: true
    });
    if (!currentYear) {
      return res.status(400).json({
        success: false,
        message: 'No active academic year found. Please create an academic year first.'
      });
    }
    academicYearId = currentYear._id;
  }

  const admissionData = {
    ...req.body,
    academicYearId
  };

  const result = await admissionService.admitStudent(
    admissionData,
    req.user.schoolId,
    req.user._id
  );

  res.status(result.statusCode).json(result);
});

// Get admission details
const getAdmissionDetails = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const result = await admissionService.getAdmissionDetails(
    studentId,
    req.user.schoolId
  );

  res.status(result.statusCode).json(result);
});

// Get all admitted students list
const getAdmittedStudents = asyncHandler(async (req, res) => {
  try {
    const StudentProfile = require('../models/StudentProfile');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const classId = req.query.classId || '';
    const sectionId = req.query.sectionId || '';
    const academicYearId = req.query.academicYearId || '';

    // Build query
    const query = { schoolId: req.user.schoolId, isActive: true };

    // Add search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Get students with population
    const students = await StudentProfile.find(query)
      .populate('userId', 'name email role')
      .populate('parentUserId', 'name email phone')
      .populate({
        path: 'currentEnrollment',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
          { path: 'academicYearId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await StudentProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Failed to get admitted students', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get students list'
    });
  }
});

// Get admission form data (dropdowns, etc.)
const getAdmissionFormData = asyncHandler(async (req, res) => {
  try {
    // Get current academic year
    const currentYear = await AcademicYear.findOne({
      schoolId: req.user.schoolId,
      isActive: true
    });

    const formData = {
      currentAcademicYear: currentYear,
      genderOptions: ['Male', 'Female', 'Other'],
      bloodGroupOptions: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    };

    res.status(200).json({
      success: true,
      data: formData
    });

  } catch (error) {
    logger.error('Failed to get admission form data', {
      error: error.message,
      schoolId: req.user.schoolId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get admission form data'
    });
  }
});

module.exports = {
  createPartialAdmission,
  completeAdmission,
  getPartialAdmissions,
  admitStudent,
  getAdmissionDetails,
  getAdmittedStudents,
  getAdmissionFormData,
  validateAdmission,
  validatePartialAdmission,
  validateCompleteAdmission
};
