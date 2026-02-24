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
  { url: 'https://sms-backend-d19v.onrender.com' },
  { url: 'http://localhost:5000' } // Replace 5000 with your local port
],
  },
 apis: ['./src/routes/*.js'] // Files containing annotations for the OpenAPI Specification
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};