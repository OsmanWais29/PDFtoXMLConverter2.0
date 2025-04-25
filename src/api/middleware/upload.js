/**
 * Middleware for handling PDF file uploads
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config/app');

// Ensure upload directory exists
const ensureUploadDirExists = () => {
  if (!fs.existsSync(config.paths.uploads)) {
    fs.mkdirSync(config.paths.uploads, { recursive: true });
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    ensureUploadDirExists();
    cb(null, config.paths.uploads);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Validate uploaded files
const fileFilter = function(req, file, cb) {
  if (!config.upload.allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PDF files are allowed'));
  }
  cb(null, true);
};

// Create multer instance with configuration
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: config.upload.maxFileSize }
});

module.exports = {
  single: upload.single('file'),
  array: upload.array('files'),
  fields: upload.fields
};