const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_URL) {
  // Cloudinary SDK automatically picks up CLOUDINARY_URL from process.env if it exists
  // but we can also set it explicitly to be sure
  cloudinary.config({
    secure: true
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// Simple check to ensure variables are loaded (without logging secret)
if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_URL) {
  console.warn('Cloudinary configuration missing. Please check .env file.');
}

module.exports = cloudinary;
