/**
 * PDF Parser Service
 * Handles extraction of data from Form 31 bankruptcy PDFs
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config/app');

/**
 * Convert a PDF to XML using Java converter
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} outputPath - Path where XML should be saved
 * @returns {Promise<string>} - Path to the generated XML file
 */
function convertPDFtoXML(pdfPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Path to the Java JAR file
    const jarPath = config.paths.converter;
    
    // Ensure the JAR file exists
    if (!fs.existsSync(jarPath)) {
      return reject(new Error('PDF to XML converter JAR file not found'));
    }
    
    // Construct the command to run the Java converter
    const command = `java -jar "${jarPath}" -input "${pdfPath}" -output "${outputPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Java converter: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`Java converter stderr: ${stderr}`);
      }
      
      console.log(`Java converter stdout: ${stdout}`);
      
      if (fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(new Error('XML file was not generated'));
      }
    });
  });
}

/**
 * Extract and parse form fields from a PDF document
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted form data
 */
async function extractFormFields(pdfPath) {
  // For now, we're using the Java converter, but this could be 
  // expanded to directly extract fields using a PDF library
  const tempOutputPath = path.join(config.paths.output, `temp-${Date.now()}.xml`);
  
  try {
    await convertPDFtoXML(pdfPath, tempOutputPath);
    
    // Here you could add code to further parse the XML and extract specific fields
    // For now, we're just returning the path to the XML file
    return {
      success: true,
      xmlPath: tempOutputPath
    };
  } catch (error) {
    console.error('Error extracting form fields:', error);
    throw new Error(`Failed to extract form fields: ${error.message}`);
  }
}

module.exports = {
  convertPDFtoXML,
  extractFormFields
};