/**
 * PDF Parser Service
 * Handles extraction of data from Form 31 bankruptcy PDFs
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const util = require('util');
const config = require('../config/config');
const logger = require('../utils/logger');
const { PDFParsingError } = require('../utils/errors');

// Convert exec to promise-based
const execAsync = util.promisify(exec);

/**
 * Validate PDF file before processing
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<boolean>} - True if valid, throws error if invalid
 */
async function validatePDFFile(pdfPath) {
  try {
    // Check if file exists
    const stats = await fs.stat(pdfPath);
    
    // Verify it's actually a file
    if (!stats.isFile()) {
      throw new PDFParsingError('Path exists but is not a file');
    }
    
    // Check file extension
    if (!pdfPath.toLowerCase().endsWith('.pdf')) {
      throw new PDFParsingError('File does not have .pdf extension');
    }
    
    // Check file size
    const maxSizeInBytes = config.storage.maxSize * 1024 * 1024; // Convert MB to bytes
    if (stats.size > maxSizeInBytes) {
      throw new PDFParsingError(`PDF file exceeds maximum size of ${config.storage.maxSize}MB`);
    }
    
    // Check if file is readable
    try {
      const fd = await fs.open(pdfPath, 'r');
      await fd.close();
    } catch (error) {
      throw new PDFParsingError(`PDF file is not readable: ${error.message}`);
    }
    
    // Basic PDF header validation
    const buffer = Buffer.alloc(5);
    const fileHandle = await fs.open(pdfPath, 'r');
    await fileHandle.read(buffer, 0, 5, 0);
    await fileHandle.close();
    
    const header = buffer.toString();
    if (!header.startsWith('%PDF-')) {
      throw new PDFParsingError('Invalid PDF file: Missing PDF header signature');
    }
    
    return true;
  } catch (error) {
    if (error instanceof PDFParsingError) {
      logger.error(`PDF validation error: ${error.message}`, { pdfPath });
      throw error;
    } else {
      logger.error(`Error validating PDF file: ${error.message}`, { pdfPath, error });
      throw new PDFParsingError(`Failed to validate PDF file: ${error.message}`);
    }
  }
}

/**
 * Convert a PDF to XML using Java converter
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} outputPath - Path where XML should be saved
 * @returns {Promise<string>} - Path to the generated XML file
 */
async function convertPDFtoXML(pdfPath, outputPath) {
  try {
    // First validate the PDF file
    await validatePDFFile(pdfPath);
    
    // Path to the Java JAR file
    const jarPath = path.join(process.cwd(), 'Converter', 'PDFtoXML.jar');
    
    // Ensure the JAR file exists
    if (!fsSync.existsSync(jarPath)) {
      throw new PDFParsingError('PDF to XML converter JAR file not found', {
        jarPath,
        code: 'CONVERTER_NOT_FOUND'
      });
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fsSync.existsSync(outputDir)) {
      logger.info(`Creating output directory: ${outputDir}`);
      await fs.mkdir(outputDir, { recursive: true });
    }
    
    // Construct the command to run the Java converter
    const command = `java -jar "${jarPath}" -input "${pdfPath}" -output "${outputPath}"`;
    
    logger.info(`Executing converter command: ${command}`);
    
    try {
      // Execute the command with timeout
      const { stdout, stderr } = await Promise.race([
        execAsync(command),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Conversion timed out after 30 seconds')), 30000)
        )
      ]);
      
      if (stderr && stderr.trim()) {
        logger.warn(`Java converter stderr: ${stderr}`);
      }
      
      logger.debug(`Java converter stdout: ${stdout}`);
      
      // Verify the XML was created
      try {
        await fs.access(outputPath, fsSync.constants.R_OK);
        
        // Check if file is not empty
        const stats = await fs.stat(outputPath);
        if (stats.size === 0) {
          throw new PDFParsingError('Generated XML file is empty');
        }
        
        logger.info(`XML file successfully generated at ${outputPath}`);
        return outputPath;
      } catch (accessError) {
        throw new PDFParsingError('XML file was not generated or is not accessible', {
          cause: accessError,
          code: 'XML_OUTPUT_ERROR'
        });
      }
    } catch (execError) {
      throw new PDFParsingError(`Error executing Java converter: ${execError.message}`, {
        cause: execError,
        code: 'CONVERTER_EXECUTION_ERROR'
      });
    }
  } catch (error) {
    if (error instanceof PDFParsingError) {
      logger.error(`PDF conversion error: ${error.message}`, { pdfPath, outputPath, code: error.code });
      throw error;
    } else {
      logger.error(`Unexpected error in PDF conversion: ${error.message}`, { error, pdfPath, outputPath });
      throw new PDFParsingError(`Failed to convert PDF to XML: ${error.message}`, {
        cause: error,
        code: 'UNEXPECTED_CONVERSION_ERROR'
      });
    }
  }
}

/**
 * Extract and parse form fields from a PDF document
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted form data
 */
async function extractFormFields(pdfPath) {
  try {
    // Create a unique output path using UUID instead of timestamp
    const { v4: uuidv4 } = require('uuid');
    const uniqueId = uuidv4();
    const tempOutputPath = path.join(config.paths.outputDir, `temp-${uniqueId}.xml`);
    
    logger.info(`Extracting form fields from ${pdfPath}`);
    
    try {
      // Convert PDF to XML
      await convertPDFtoXML(pdfPath, tempOutputPath);
      
      // Read the XML file and parse it
      const xml2js = require('xml2js');
      const parser = new xml2js.Parser({ explicitArray: false });
      
      const xmlData = await fs.readFile(tempOutputPath, 'utf8');
      const parsedData = await parser.parseStringPromise(xmlData);
      
      // Extract form fields from the parsed XML
      // This would need to be customized based on the actual XML structure
      const formFields = extractFieldsFromXML(parsedData);
      
      return {
        success: true,
        xmlPath: tempOutputPath,
        fields: formFields
      };
    } catch (error) {
      if (error instanceof PDFParsingError) {
        throw error;
      } else {
        throw new PDFParsingError(`Failed to extract form fields: ${error.message}`, {
          cause: error,
          code: 'EXTRACTION_ERROR'
        });
      }
    }
  } catch (error) {
    logger.error(`Error in form field extraction: ${error.message}`, { 
      pdfPath, 
      errorCode: error.code || 'UNKNOWN_ERROR',
      stack: error.stack 
    });
    
    return {
      success: false,
      error: error.message,
      code: error.code || 'EXTRACTION_FAILED'
    };
  }
}

/**
 * Helper function to extract fields from XML structure
 * @private
 * @param {Object} parsedXml - Parsed XML object
 * @returns {Object} - Extracted form fields
 */
function extractFieldsFromXML(parsedXml) {
  try {
    // This is a simplified implementation
    // In a real application, this would map XML nodes to form fields
    // based on the structure of Form 31
    
    const formFields = {
      // Default empty structure
      personalInformation: {},
      financialInformation: {
        assets: [],
        liabilities: []
      },
      certification: {}
    };
    
    // Example extraction - assumes a specific XML structure
    // Would need to be adjusted based on actual XML output
    if (parsedXml && parsedXml.form && parsedXml.form.content) {
      const content = parsedXml.form.content;
      
      // Extract personal information
      if (content.personalInfo) {
        formFields.personalInformation = {
          fullName: content.personalInfo.name || '',
          dateOfBirth: content.personalInfo.dob || '',
          address: {
            street: content.personalInfo.address?.street || '',
            city: content.personalInfo.address?.city || '',
            province: content.personalInfo.address?.province || '',
            postalCode: content.personalInfo.address?.postalCode || '',
            country: content.personalInfo.address?.country || 'Canada'
          }
        };
      }
      
      // Additional extraction logic would go here
      // ...
      
    } else {
      logger.warn('Parsed XML does not contain expected structure', { structure: JSON.stringify(parsedXml) });
    }
    
    return formFields;
  } catch (error) {
    logger.error(`Error extracting fields from XML: ${error.message}`, { error });
    return {}; // Return empty object on error
  }
}

/**
 * Cleanup temporary XML files
 * @param {string} xmlPath - Path to XML file
 * @returns {Promise<boolean>} - Success status
 */
async function cleanupTemporaryFiles(xmlPath) {
  try {
    if (xmlPath && xmlPath.includes('temp-') && fsSync.existsSync(xmlPath)) {
      await fs.unlink(xmlPath);
      logger.debug(`Cleaned up temporary file: ${xmlPath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.warn(`Failed to cleanup temporary file ${xmlPath}: ${error.message}`);
    return false;
  }
}

module.exports = {
  convertPDFtoXML,
  extractFormFields,
  validatePDFFile,
  cleanupTemporaryFiles
};