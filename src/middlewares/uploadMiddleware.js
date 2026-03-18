const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create directories for uploads
ensureDirectoryExists(path.join(__dirname, '..', 'public', 'uploads', 'profile-images'));

// Configure storage for profile images (disk storage for persistent storage)
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads', 'profile-images'));
  },
  filename: (req, file, cb) => {
    // Create unique filename with user ID and timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.userId}_${uniqueSuffix}${ext}`);
  }
});

// Configure storage for CSV (memory storage for processing)
const csvStorage = multer.memoryStorage();

// File filter for CSV
const csvFilter = (req, file, cb) => {
  const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
  const allowedExts = ['.csv'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// File filter for profile images
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and GIF images are allowed'), false);
  }
};

// Profile image upload middleware
const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1
  }
}).single('image');

// CSV upload middleware
const uploadCSV = multer({
  storage: csvStorage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1
  }
}).single('file');

// Wrapper to handle multer errors for CSV
const handleCSVUpload = (req, res, next) => {
  uploadCSV(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a CSV file.'
      });
    }
    
    next();
  });
};

// Wrapper to handle multer errors for profile images
const handleProfileImageUpload = (req, res, next) => {
  uploadProfileImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image too large. Maximum size is 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded. Please upload an image file.'
      });
    }
    
    next();
  });
};

module.exports = { 
  handleCSVUpload,
  handleProfileImageUpload,
  uploadProfileImage
};
