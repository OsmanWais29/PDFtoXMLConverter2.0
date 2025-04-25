/**
 * PDF to XML Converter Routes
 * Defines API routes for the conversion functionality
 */
const express = require('express');
const router = express.Router();
const converterController = require('../controllers/converter');
const uploadMiddleware = require('../middleware/upload');

// Route for PDF to XML conversion
router.post('/convert', uploadMiddleware.array, converterController.convertFiles);

// Route for downloading converted XML files
router.get('/download/:filename', converterController.downloadFile);

// Route for checking conversion status
router.get('/status/:jobId', converterController.checkStatus);

module.exports = router;