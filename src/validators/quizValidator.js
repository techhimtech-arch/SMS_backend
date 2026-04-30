const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

// Validation helpers
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Create Quiz Validation
const validateCreateQuiz = [
  body('title')
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ max: 200 })
    .withMessage('Quiz title cannot exceed 200 characters')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
    
  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid subject ID'),
    
  body('classId')
    .if(() => {
      // classId required only if not school-wide
      return false; // We'll use custom validator below
    })
    .notEmpty()
    .withMessage('Class ID is required')
    .custom((value, { req }) => {
      // Skip validation if school-wide quiz
      if (req.body.isSchoolWide === true) {
        return true;
      }
      // For class-specific quiz, classId is required
      if (!value) {
        throw new Error('Class ID is required for class-specific quizzes');
      }
      if (!isValidObjectId(value)) {
        throw new Error('Invalid class ID');
      }
      return true;
    }),
    
  body('sectionId')
    .custom((value, { req }) => {
      // Skip validation if school-wide quiz
      if (req.body.isSchoolWide === true) {
        return true;
      }
      // For class-specific quiz, sectionId is required
      if (!value) {
        throw new Error('Section ID is required for class-specific quizzes');
      }
      if (!isValidObjectId(value)) {
        throw new Error('Invalid section ID');
      }
      return true;
    }),
    
  body('quizType')
    .optional()
    .isIn(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'MIXED'])
    .withMessage('Invalid quiz type'),
    
  body('timeLimit')
    .notEmpty()
    .withMessage('Time limit is required')
    .isInt({ min: 1, max: 180 })
    .withMessage('Time limit must be between 1 and 180 minutes'),
    
  body('maxMarks')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Maximum marks must be at least 1'),
    
  body('passingMarks')
    .notEmpty()
    .withMessage('Passing marks is required')
    .isFloat({ min: 0 })
    .withMessage('Passing marks cannot be negative'),
    
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
    
  body('questions.*.question')
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ max: 500 })
    .withMessage('Question cannot exceed 500 characters')
    .trim(),
    
  body('questions.*.options')
    .isArray({ min: 2 })
    .withMessage('At least 2 options are required'),
    
  body('questions.*.options.*')
    .notEmpty()
    .withMessage('Option text is required')
    .isLength({ max: 200 })
    .withMessage('Option cannot exceed 200 characters')
    .trim(),
    
  body('questions.*.correctAnswer')
    .notEmpty()
    .withMessage('Correct answer is required')
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a valid option index'),
    
  body('questions.*.marks')
    .notEmpty()
    .withMessage('Question marks are required')
    .isFloat({ min: 1 })
    .withMessage('Question marks must be at least 1'),
    
  body('questions.*.explanation')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Explanation cannot exceed 500 characters')
    .trim(),
    
  body('startsAt')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Invalid start time format'),
    
  body('endsAt')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('Invalid end time format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startsAt)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
    
  body('allowRetake')
    .optional()
    .isBoolean()
    .withMessage('Allow retake must be boolean'),
    
  body('maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum attempts must be at least 1'),
    
  body('showCorrectAnswers')
    .optional()
    .isBoolean()
    .withMessage('Show correct answers must be boolean'),
    
  body('showResultsImmediately')
    .optional()
    .isBoolean()
    .withMessage('Show results immediately must be boolean'),
    
  body('randomizeQuestions')
    .optional()
    .isBoolean()
    .withMessage('Randomize questions must be boolean'),
    
  body('randomizeOptions')
    .optional()
    .isBoolean()
    .withMessage('Randomize options must be boolean'),
    
  body('isSchoolWide')
    .optional()
    .isBoolean()
    .withMessage('Is school wide must be boolean')
];

// Update Quiz Validation
const validateUpdateQuiz = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Quiz title cannot exceed 200 characters')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
    
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Time limit must be between 1 and 180 minutes'),
    
  body('passingMarks')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Passing marks cannot be negative'),
    
  body('questions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
    
  body('questions.*.question')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Question cannot exceed 500 characters')
    .trim(),
    
  body('questions.*.options')
    .optional()
    .isArray({ min: 2 })
    .withMessage('At least 2 options are required'),
    
  body('questions.*.options.*')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Option cannot exceed 200 characters')
    .trim(),
    
  body('questions.*.correctAnswer')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a valid option index'),
    
  body('questions.*.marks')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Question marks must be at least 1'),
    
  body('questions.*.explanation')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Explanation cannot exceed 500 characters')
    .trim(),
    
  body('startsAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid start time format'),
    
  body('endsAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid end time format')
    .custom((value, { req }) => {
      if (req.body.startsAt && new Date(value) <= new Date(req.body.startsAt)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('maxAttempts')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Maximum attempts must be between 1 and 5'),

  body('allowRetake')
    .optional()
    .isBoolean()
    .withMessage('Allow retake must be boolean'),

  body('showCorrectAnswers')
    .optional()
    .isBoolean()
    .withMessage('Show correct answers must be boolean'),

  body('showResultsImmediately')
    .optional()
    .isBoolean()
    .withMessage('Show results immediately must be boolean')
];

// Quiz Answer Validation
const validateQuizAnswer = [
  body('questionIndex')
    .notEmpty()
    .withMessage('Question index is required')
    .isInt({ min: 0 })
    .withMessage('Question index must be a non-negative integer'),
    
  body('selectedAnswer')
    .notEmpty()
    .withMessage('Selected answer is required')
    .isInt({ min: 0 })
    .withMessage('Selected answer must be a valid option index')
];

// Quiz Submission Validation
const validateQuizSubmission = [
  body('answers')
    .optional()
    .isArray()
    .withMessage('Answers must be an array'),
    
  body('answers.*.questionIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Question index must be a non-negative integer'),
    
  body('answers.*.selectedAnswer')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Selected answer must be a valid option index')
];

// Quiz ID Validation
const validateQuizId = [
  param('id')
    .notEmpty()
    .withMessage('Quiz ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid quiz ID')
];

// Pagination Validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  validateCreateQuiz,
  validateUpdateQuiz,
  validateQuizAnswer,
  validateQuizSubmission,
  validateQuizId,
  validatePagination
};
