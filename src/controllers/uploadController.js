const asyncHandler = require('express-async-handler');
const { uploadToCloudinary } = require('../services/fileService');

/**
 * @desc    Upload a single file
 * @route   POST /api/v1/upload
 * @access  Private
 */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  try {
    // Determine folder based on user role or request type
    let folder = 'materials';
    if (req.body.type === 'assignment') folder = 'assignments';
    if (req.body.type === 'profile') folder = 'profiles';
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer, 
      `school_${req.user.schoolId}/${folder}`,
      req.file.originalname
    );

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file to storage',
      error: error.message
    });
  }
});

module.exports = {
  uploadFile
};
