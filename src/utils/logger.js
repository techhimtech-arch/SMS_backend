const winston = require('winston');
const crypto = require('crypto');

const { combine, timestamp, json, errors, printf } = winston.format;

// Custom format for structured JSON logs
const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }), // Include stack trace for errors
  json()
);

// Human-readable format for development
const devFormat = printf(({ level, message, timestamp, service, environment, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${service}] ${level.toUpperCase()}: ${message} ${metaStr}`;
});

// Create logger instance - Console transport only (Render captures stdout/stderr)
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? logFormat : combine(
    logFormat,
    printf(({ level, message, timestamp, service, environment, ...meta }) => {
      // Remove emojis from production logs
      const cleanMessage = message.replace(/[^\x00-\x7F]/g, '');
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${service}] ${level.toUpperCase()}: ${cleanMessage} ${metaStr}`;
    })
  ),
  defaultMeta: {
    service: 'sms-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Helper to log with request context
logger.withRequest = (req) => {
  const requestId = req.requestId || crypto.randomUUID().slice(0, 8);
  req.requestId = requestId; // Set it for future use
  
  return {
    info: (message, meta = {}) => logger.info(message, { requestId, userId: req.user?.id, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { requestId, userId: req.user?.id, ...meta }),
    error: (message, meta = {}) => logger.error(message, { requestId, userId: req.user?.id, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { requestId, userId: req.user?.id, ...meta }),
    
    // Performance helpers
    performance: (operation) => {
      const start = Date.now();
      return {
        end: (additionalMeta = {}) => {
          const duration = Date.now() - start;
          logger.info(`${operation} completed`, { 
            operation, 
            duration: `${duration}ms`, 
            requestId, 
            userId: req.user?.id,
            ...additionalMeta 
          });
        }
      };
    }
  };
};

// Security logging helper
logger.security = (action, details = {}) => {
  logger.warn(`SECURITY: ${action}`, { 
    type: 'security', 
    action, 
    ...details 
  });
};

// Business logic logging helper
logger.business = (event, details = {}) => {
  logger.info(`BUSINESS: ${event}`, { 
    type: 'business', 
    event, 
    ...details 
  });
};

// API logging helper
logger.api = (method, endpoint, statusCode, duration, details = {}) => {
  const level = statusCode >= 400 ? 'warn' : statusCode >= 500 ? 'error' : 'info';
  logger[level](`API: ${method} ${endpoint} ${statusCode}`, { 
    type: 'api', 
    method, 
    endpoint, 
    statusCode, 
    duration: `${duration}ms`,
    ...details 
  });
};

module.exports = logger;
