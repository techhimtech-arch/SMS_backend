const express = require('express');
const router = express.Router();

// Test simple route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test route works' });
});

module.exports = router;
