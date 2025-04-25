/**
 * PDF to XML Converter Controller
 * Handles conversion requests and responses
 */
const path = require('path');
const fs = require('fs');
const pdfParser = require('../../services/pdfParser');
const xmlGenerator = require('../../services/xmlGenerator');
const { catchAsync, ApiError } = require('../../utils/errorHandler');
const config = require('../../config/app');

/**
 * Convert PDF files to XML
 */
const convertFiles = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files were uploaded');
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(config.paths.output)) {
    fs.mkdirSync(config.paths.output, { recursive: true });
  }

  // Process each uploaded PDF
  const results = [];
  for (const file of req.files) {
    const xmlName = path.basename(file.originalname, '.pdf') + '.xml';
    const xmlPath = path.join(config.paths.output, xmlName);
    
    try {
      // Extract data from PDF
      const formData = await pdfParser.extractFormFields(file.path);
      formData.sourceFile = file.originalname;
      
      // Generate XML file
      const generatedXmlPath = await xmlGenerator.generateXML(formData, xmlPath);
      
      // Validate XML against schema
      const isValid = await xmlGenerator.validateXMLSchema(generatedXmlPath);
      
      // Ensure compliance with ISED requirements
      if (isValid) {
        const compliantXmlPath = await xmlGenerator.ensureISEDCompliance(generatedXmlPath);
        
        results.push({
          originalName: file.originalname,
          xmlName: xmlName,
          xmlPath: compliantXmlPath,
          success: true
        });
      } else {
        throw new Error('XML validation failed');
      }
    } catch (error) {
      console.error(`Error converting ${file.originalname}:`, error);
      results.push({
        originalName: file.originalname,
        success: false,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Files processed',
    results: results
  });
});

/**
 * Download a converted XML file
 */
const downloadFile = catchAsync(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(config.paths.output, filename);
  
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'File not found');
  }
  
  res.download(filePath);
});

/**
 * Check conversion status by job ID
 * (In a real implementation, this would check a database for job status)
 */
const checkStatus = catchAsync(async (req, res) => {
  const jobId = req.params.jobId;
  
  // Placeholder implementation - in a real system, this would query a database
  res.status(200).json({
    success: true,
    jobId: jobId,
    status: 'completed', // Or 'pending', 'failed', etc.
    message: 'Conversion completed successfully'
  });
});

module.exports = {
  convertFiles,
  downloadFile,
  checkStatus
};