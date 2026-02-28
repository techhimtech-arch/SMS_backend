require('dotenv').config();

// Validate environment variables FIRST (before loading app)
const validateEnv = require('./config/validateEnv');
validateEnv();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
  console.log(`🔒 Security hardening enabled: Helmet, Rate Limiting, CORS`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});