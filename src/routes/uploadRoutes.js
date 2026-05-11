const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware'); 

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific formats if needed, or allow all for now
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Images and Word docs are allowed.'), false);
    }
  }
});

router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;
