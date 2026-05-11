const cloudinary = require('../config/cloudinary');
const stream = require('stream');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {String} fileName - Desired file name
 * @returns {Promise} - Cloudinary upload response
 */
const uploadToCloudinary = (fileBuffer, folder = 'school_management', fileName = null) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName ? fileName.split('.')[0] : undefined,
        resource_type: 'auto',
        // Pass config explicitly if needed, but SDK usually handles it
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise} - Cloudinary deletion response
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
