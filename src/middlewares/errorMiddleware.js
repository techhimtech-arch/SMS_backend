const ErrorResponse = require('../utils/errorResponse');

// Handle CORS errors
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return next(new ErrorResponse('CORS: Origin not allowed', 403));
  }
  next(err);
};

// 404 Handler - Route not found
const notFoundHandler = (req, res, next) => {
  next(new ErrorResponse(`Route ${req.method} ${req.url} not found`, 404));
};

// Centralized error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ErrorResponse('Resource not found', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ErrorResponse(`Duplicate value for field: ${field}`, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired', 401);
  }

  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : error.message || 'Something went wrong!';

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  corsErrorHandler,
  notFoundHandler,
  errorHandler
};
