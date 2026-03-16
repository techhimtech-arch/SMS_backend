const logger = require('../utils/logger');

// Middleware to add request ID and log API calls
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Generate request ID if not already set
  if (!req.requestId) {
    req.requestId = require('crypto').randomUUID().slice(0, 8);
  }
  
  // Log request start
  const log = logger.withRequest(req);
  log.info(`API Request started`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.api(req.method, req.originalUrl, res.statusCode, duration, {
      requestId: req.requestId,
      userId: req.user?.id,
      contentLength: res.get('Content-Length')
    });
    
    // Call original end
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = requestLogger;
