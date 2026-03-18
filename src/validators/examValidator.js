const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation results handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Create exam validation
 */
const validateCreateExam = [
  body('name')
    .notEmpty()
    .withMessage('Exam name is required')
    .isLength({ max: 200 })
    .withMessage('Exam name cannot exceed 200 characters')
    .trim(),
  
  body('examType')
    .notEmpty()
    .withMessage('Exam type is required')
    .isIn(['UNIT_TEST', 'MID_TERM', 'FINAL_TERM', 'PRACTICAL', 'VIVA', 'QUIZ', 'ASSIGNMENT'])
    .withMessage('Invalid exam type'),
  
  body('sessionId')
    .notEmpty()
    .withMessage('Academic session ID is required')
    .isMongoId()
    .withMessage('Invalid academic session ID'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Invalid section ID'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  
  body('instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Instructions cannot exceed 2000 characters')
    .trim(),
  
  body('passingPercentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing percentage must be between 0 and 100'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  
  body('venue')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters')
    .trim(),
  
  handleValidationErrors
];

/**
 * Update exam validation
 */
const validateUpdateExam = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Exam name must be between 1 and 200 characters')
    .trim(),
  
  body('examType')
    .optional()
    .isIn(['UNIT_TEST', 'MID_TERM', 'FINAL_TERM', 'PRACTICAL', 'VIVA', 'QUIZ', 'ASSIGNMENT'])
    .withMessage('Invalid exam type'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  
  body('instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Instructions cannot exceed 2000 characters')
    .trim(),
  
  body('passingPercentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing percentage must be between 0 and 100'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  
  body('venue')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

/**
 * Assign subjects validation
 */
const validateAssignSubjects = [
  body('subjectAssignments')
    .isArray({ min: 1 })
    .withMessage('Subject assignments array is required'),
  
  body('subjectAssignments.*.subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID'),
  
  body('subjectAssignments.*.teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  
  body('subjectAssignments.*.maxMarks')
    .notEmpty()
    .withMessage('Maximum marks is required')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Maximum marks must be between 1 and 1000'),
  
  body('subjectAssignments.*.passingMarks')
    .notEmpty()
    .withMessage('Passing marks is required')
    .isInt({ min: 0 })
    .withMessage('Passing marks must be at least 0')
    .custom((value, { req }) => {
      const maxMarks = req.body.subjectAssignments.find((_, index) => 
        req.path.includes(`[${index}]`)
      )?.maxMarks;
      if (maxMarks && value > maxMarks) {
        throw new Error('Passing marks cannot exceed maximum marks');
      }
      return true;
    }),
  
  body('subjectAssignments.*.examDate')
    .notEmpty()
    .withMessage('Exam date is required')
    .isISO8601()
    .withMessage('Invalid exam date format'),
  
  body('subjectAssignments.*.startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  
  body('subjectAssignments.*.endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage('End time must be in HH:MM format (24-hour)')
    .custom((value, { req }) => {
      const startTime = req.body.subjectAssignments.find((_, index) => 
        req.path.includes(`[${index}]`)
      )?.startTime;
      if (startTime && value <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  
  body('subjectAssignments.*.duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  
  body('subjectAssignments.*.venue')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters')
    .trim(),
  
  body('subjectAssignments.*.instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Instructions cannot exceed 2000 characters')
    .trim(),
  
  handleValidationErrors
];

/**
 * Update subject paper validation
 */
const validateUpdateSubjectPaper = [
  body('maxMarks')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Maximum marks must be between 1 and 1000'),
  
  body('passingMarks')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Passing marks must be at least 0'),
  
  body('examDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid exam date format'),
  
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage('End time must be in HH:MM format (24-hour)'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  
  body('venue')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters')
    .trim(),
  
  body('instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Instructions cannot exceed 2000 characters')
    .trim(),
  
  handleValidationErrors
];

/**
 * Bulk marks entry validation
 */
const validateBulkMarksEntry = [
  body('marksData')
    .isArray({ min: 1 })
    .withMessage('Marks data array is required'),
  
  body('marksData.*.studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
  
  body('marksData.*.examSubjectPaperId')
    .notEmpty()
    .withMessage('Subject paper ID is required')
    .isMongoId()
    .withMessage('Invalid subject paper ID'),
  
  body('marksData.*.marksObtained')
    .notEmpty()
    .withMessage('Marks obtained is required')
    .isFloat({ min: 0 })
    .withMessage('Marks obtained must be at least 0'),
  
  body('marksData.*.remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters')
    .trim(),
  
  handleValidationErrors
];

/**
 * Update marks validation
 */
const validateUpdateMarks = [
  body('marksObtained')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Marks obtained must be at least 0'),
  
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters')
    .trim(),
  
  body('teacherRemarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Teacher remarks cannot exceed 500 characters')
    .trim(),
  
  handleValidationErrors
];

/**
 * Lock marks validation
 */
const validateLockMarks = [
  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID'),
  
  handleValidationErrors
];

/**
 * List exams validation
 */
const validateListExams = [
  query('classId')
    .optional()
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  query('sectionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid section ID'),
  
  query('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid session ID'),
  
  query('status')
    .optional()
    .isIn(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Invalid status'),
  
  query('examType')
    .optional()
    .isIn(['UNIT_TEST', 'MID_TERM', 'FINAL_TERM', 'PRACTICAL', 'VIVA', 'QUIZ', 'ASSIGNMENT'])
    .withMessage('Invalid exam type'),
  
  handleValidationErrors
];

/**
 * MongoDB ID validation
 */
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

/**
 * MongoDB ID validation for marks
 */
const validateMarksId = [
  param('marksId')
    .isMongoId()
    .withMessage('Invalid marks ID format'),
  
  handleValidationErrors
];

/**
 * Student ID validation
 */
const validateStudentId = [
  param('studentId')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateExam,
  validateUpdateExam,
  validateAssignSubjects,
  validateUpdateSubjectPaper,
  validateBulkMarksEntry,
  validateUpdateMarks,
  validateLockMarks,
  validateListExams,
  validateMongoId,
  validateMarksId,
  validateStudentId,
  handleValidationErrors
};
