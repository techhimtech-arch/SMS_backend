const { check, body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Create fee structure validation (Legacy support)
const validateCreateFeeStructure = [
  check('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid Class ID format'),

  check('academicYear')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY (e.g., 2024-2025)'),

  check('academicSessionId')
    .optional()
    .isMongoId().withMessage('Invalid academic session ID'),

  check('tuitionFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number'),

  check('transportFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Transport fee must be a positive number'),

  check('examFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Exam fee must be a positive number'),

  check('otherCharges')
    .optional()
    .isFloat({ min: 0 }).withMessage('Other charges must be a positive number'),

  // Phase 5: feeHeads validation
  check('feeHeads')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one fee head is required'),

  check('feeHeads.*.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Fee head name must be between 2 and 100 characters'),

  check('feeHeads.*.amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Fee head amount must be a positive number'),

  check('feeHeads.*.frequency')
    .optional()
    .isIn(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']).withMessage('Invalid fee frequency'),

  handleValidation,
];

// Update fee structure validation (Legacy support)
const validateUpdateFeeStructure = [
  check('tuitionFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number'),

  check('transportFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Transport fee must be a positive number'),

  check('examFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Exam fee must be a positive number'),

  check('otherCharges')
    .optional()
    .isFloat({ min: 0 }).withMessage('Other charges must be a positive number'),

  // Phase 5: feeHeads validation
  check('feeHeads')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one fee head is required'),

  check('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),

  handleValidation,
];

// Record fee payment validation (Legacy support)
const validateFeePayment = [
  check('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid Student ID format'),

  check('feeStructureId')
    .optional()
    .isMongoId().withMessage('Invalid Fee Structure ID format'),

  check('studentFeeId')
    .optional()
    .isMongoId().withMessage('Invalid Student Fee ID format'),

  check('feeItemId')
    .optional()
    .isMongoId().withMessage('Invalid Fee Item ID format'),

  check('amountPaid')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount paid must be greater than 0'),

  check('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

  check('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'CASH', 'ONLINE', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE']).withMessage('Invalid payment method'),

  check('paymentMode')
    .optional()
    .isIn(['CASH', 'ONLINE', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE']).withMessage('Invalid payment mode'),

  check('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Transaction ID must not exceed 100 characters'),

  check('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks must not exceed 500 characters'),

  handleValidation,
];

// ============ Phase 5 Advanced Validations ============

// Validation for generating student fees
const validateGenerateStudentFees = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),

  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid class ID'),

  body('sectionId')
    .notEmpty().withMessage('Section ID is required')
    .isMongoId().withMessage('Invalid section ID'),

  body('academicSessionId')
    .notEmpty().withMessage('Academic session ID is required')
    .isMongoId().withMessage('Invalid academic session ID'),

  body('customFeeItems')
    .optional()
    .isArray().withMessage('Custom fee items must be an array'),

  body('customFeeItems.*.feeHeadId')
    .optional()
    .isMongoId().withMessage('Invalid fee head ID'),

  body('customFeeItems.*.amount')
    .optional()
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0 }).withMessage('Amount must be at least 0'),

  body('customFeeItems.*.dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date'),

  handleValidation,
];

// Validation for making payment (Phase 5)
const validateMakePayment = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),

  body('studentFeeId')
    .notEmpty().withMessage('Student fee ID is required')
    .isMongoId().withMessage('Invalid student fee ID'),

  body('feeItemId')
    .notEmpty().withMessage('Fee item ID is required')
    .isMongoId().withMessage('Invalid fee item ID'),

  body('amountPaid')
    .notEmpty().withMessage('Amount paid is required')
    .isNumeric().withMessage('Amount paid must be a number')
    .isFloat({ min: 0.01 }).withMessage('Amount paid must be at least 0.01'),

  body('paymentMode')
    .notEmpty().withMessage('Payment mode is required')
    .isIn(['CASH', 'ONLINE', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE']).withMessage('Invalid payment mode'),

  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Transaction ID cannot exceed 100 characters'),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),

  handleValidation,
];

// Validation for processing refund
const validateProcessRefund = [
  param('paymentId')
    .notEmpty().withMessage('Payment ID is required')
    .isMongoId().withMessage('Invalid payment ID'),

  body('refundAmount')
    .notEmpty().withMessage('Refund amount is required')
    .isNumeric().withMessage('Refund amount must be a number')
    .isFloat({ min: 0.01 }).withMessage('Refund amount must be at least 0.01'),

  body('reason')
    .notEmpty().withMessage('Refund reason is required')
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Refund reason must be between 5 and 500 characters'),

  handleValidation,
];

// Validation for query parameters
const validateFeeQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('classId')
    .optional()
    .isMongoId().withMessage('Invalid class ID'),

  query('academicSessionId')
    .optional()
    .isMongoId().withMessage('Invalid academic session ID'),

  query('studentId')
    .optional()
    .isMongoId().withMessage('Invalid student ID'),

  query('fromDate')
    .optional()
    .isISO8601().withMessage('From date must be a valid date'),

  query('toDate')
    .optional()
    .isISO8601().withMessage('To date must be a valid date'),

  handleValidation,
];

// Validation for student ID parameter
const validateStudentIdParam = [
  param('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),

  handleValidation,
];

// Validation for payment ID parameter
const validatePaymentIdParam = [
  param('paymentId')
    .notEmpty().withMessage('Payment ID is required')
    .isMongoId().withMessage('Invalid payment ID'),

  handleValidation,
];

module.exports = {
  // Legacy validations
  validateCreateFeeStructure,
  validateUpdateFeeStructure,
  validateFeePayment,
  // Phase 5 validations
  validateGenerateStudentFees,
  validateMakePayment,
  validateProcessRefund,
  validateFeeQueryParams,
  validateStudentIdParam,
  validatePaymentIdParam,
  handleValidation,
};

