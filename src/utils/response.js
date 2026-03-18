/**
 * Response Utility
 * Provides standardized response format for all APIs
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {Object|Array} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = {}) => {
  const response = {
    success: true,
    message,
    data,
    ...meta
  };

  // Remove data field if null/undefined
  if (data === null || data === undefined) {
    delete response.data;
  }

  // Remove meta field if empty
  if (Object.keys(meta).length === 0) {
    delete response.meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {Array} errors - Detailed error array (for validation errors)
 * @param {Object} meta - Additional metadata
 */
const sendError = (res, statusCode = 500, message = 'Internal server error', errors = [], meta = {}) => {
  const response = {
    success: false,
    message,
    ...meta
  };

  // Add errors array if provided
  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination metadata
 */
const sendPaginatedResponse = (res, message = 'Data retrieved successfully', data = [], pagination = {}) => {
  return sendSuccess(res, 200, message, data, { pagination });
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Created resource data
 */
const sendCreated = (res, message = 'Resource created successfully', data = null) => {
  return sendSuccess(res, 201, message, data);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendNoContent = (res, message = 'Operation completed successfully') => {
  return sendSuccess(res, 204, message);
};

/**
 * Handle async errors and send standardized error response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 */
const handleAsyncError = (res, error, defaultMessage = 'Internal server error') => {
  console.error('Async error:', error);

  // If error has statusCode (custom error), use it
  if (error.statusCode) {
    return sendError(
      res,
      error.statusCode,
      error.message,
      error.errors || []
    );
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return sendError(res, 400, 'Validation failed', errors);
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return sendError(res, 400, `${field} already exists`);
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format');
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }

  // Default internal server error
  return sendError(res, 500, defaultMessage);
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  sendCreated,
  sendNoContent,
  handleAsyncError
};
