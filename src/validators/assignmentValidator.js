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
 * Create assignment validation
 */
const validateCreateAssignment = [
  body('title')
    .notEmpty()
    .withMessage('Assignment title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('Assignment description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters')
    .trim(),

  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID'),

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

  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid due date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),

  body('maxMarks')
    .notEmpty()
    .withMessage('Maximum marks is required')
    .isFloat({ min: 0 })
    .withMessage('Maximum marks must be a positive number'),

  body('allowLateSubmission')
    .optional()
    .isBoolean()
    .withMessage('Allow late submission must be a boolean'),

  body('lateSubmissionPenalty')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Late submission penalty must be between 0 and 100'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  handleValidationErrors
];

/**
 * Update assignment validation
 */
const validateUpdateAssignment = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters')
    .trim(),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),

  body('maxMarks')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum marks must be a positive number'),

  body('allowLateSubmission')
    .optional()
    .isBoolean()
    .withMessage('Allow late submission must be a boolean'),

  body('lateSubmissionPenalty')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Late submission penalty must be between 0 and 100'),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CLOSED'])
    .withMessage('Invalid status value'),

  handleValidationErrors
];

/**
 * Submit assignment validation
 */
const validateSubmitAssignment = [
  body('submissionText')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Submission text cannot exceed 10000 characters')
    .trim(),

  body('lateSubmissionReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Late submission reason cannot exceed 500 characters')
    .trim()
    .custom((value, { req }) => {
      // If submission is late, reason is required
      // This will be validated in the controller based on due date
      return true;
    }),

  handleValidationErrors
];

/**
 * Grade submission validation
 */
const validateGradeSubmission = [
  body('submissionId')
    .notEmpty()
    .withMessage('Submission ID is required')
    .isMongoId()
    .withMessage('Invalid submission ID'),

  body('marksObtained')
    .notEmpty()
    .withMessage('Marks obtained is required')
    .isFloat({ min: 0 })
    .withMessage('Marks obtained must be a non-negative number'),

  body('remarks')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Remarks cannot exceed 1000 characters')
    .trim(),

  handleValidationErrors
];

/**
 * List assignments validation
 */
const validateListAssignments = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CLOSED'])
    .withMessage('Invalid status value'),

  query('subjectId')
    .optional()
    .isMongoId()
    .withMessage('Invalid subject ID'),

  query('classId')
    .optional()
    .isMongoId()
    .withMessage('Invalid class ID'),

  query('sectionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid section ID'),

  query('sortBy')
    .optional()
    .isIn(['dueDate', 'createdAt', 'title', 'maxMarks'])
    .withMessage('Invalid sort by field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Invalid sort order'),

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

module.exports = {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateSubmitAssignment,
  validateGradeSubmission,
  validateListAssignments,
  validateMongoId,
  handleValidationErrors
};
