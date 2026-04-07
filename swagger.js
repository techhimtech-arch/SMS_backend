const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management System API',
      version: '1.0.0',
      description: 'Multi-school SaaS backend APIs',
    },
    servers: [
      { url: 'https://sms-backend-d19v.onrender.com/api/v1', description: 'Production' },
      { url: 'http://localhost:5000/api/v1', description: 'Local Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (without "Bearer " prefix)'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};

// Student APIs
/**
 * @swagger
 * /api/v1/students/dashboard:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched student dashboard data
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/attendance:
 *   get:
 *     summary: Get student attendance data
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched attendance data
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/exam-results:
 *   get:
 *     summary: Get student exam results
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched exam results
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/fees:
 *   get:
 *     summary: Get student fee details
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched fee details
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/study-materials:
 *   get:
 *     summary: Get study materials for student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched study materials
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/assignments:
 *   get:
 *     summary: Get student assignments
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched assignments
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/announcements:
 *   get:
 *     summary: Get student announcements
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched announcements
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/timetable:
 *   get:
 *     summary: Get student timetable
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched timetable
 *       403:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/students/certificates:
 *   get:
 *     summary: Get student certificates
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched certificates
 *       403:
 *         description: Unauthorized access
 */