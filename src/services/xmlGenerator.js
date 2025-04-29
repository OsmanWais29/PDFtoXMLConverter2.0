/**
 * XML Generator Service
 * Handles generation and validation of XML documents according to ISED Canada schema
 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const xml2js = require('xml2js');
const libxmljs = require('libxmljs2');
const config = require('../config/app');
const logger = require('../utils/logger');
const { XMLGenerationError } = require('../utils/errors');

// Promisify fs functions
const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);
const mkdirAsync = util.promisify(fs.mkdir);

/**
 * Generate XML file from structured data
 * @param {Object} formData - Structured data extracted from the PDF
 * @param {string} documentId - Unique ID for the document
 * @returns {Promise<Object>} - Result of XML generation with the XML string
 */
async function generateXML(formData, documentId) {
  try {
    if (!formData) {
      throw new XMLGenerationError('No form data provided for XML generation');
    }

    logger.info(`Generating XML for document: ${documentId}`);

    // Create a properly structured XML document based on Form 31 schema
    const xmlObj = {
      document: {
        $: { 
          xmlns: 'http://ised-isde.canada.ca/form31/schema/1.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation': 'http://ised-isde.canada.ca/form31/schema/1.0 form31.xsd'
        },
        form: {
          $: { 
            type: 'bankruptcy',
            'form-number': '31',
            version: '1.0'
          },
          metadata: {
            'generated-timestamp': new Date().toISOString(),
            'source-file': formData.sourceFile || 'unknown',
            'document-id': documentId,
            'generation-system': config.appName || 'PDF-to-XML-Converter'
          },
          content: {}
        }
      }
    };

    // Add form data to content section, mapping fields to the XML structure
    // This section needs to be customized based on exact Form 31 schema requirements
    const content = xmlObj.document.form.content;

    // Map fields according to the schema
    mapDataToXmlStructure(content, formData);

    // Generate XML string with pretty formatting
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' }
    });
    
    const xml = builder.buildObject(xmlObj);
    
    return {
      success: true,
      xml,
      valid: true // Assuming valid, actual validation happens in validateXMLSchema
    };
    
  } catch (error) {
    logger.error(`Error generating XML: ${error.message}`, { error, documentId });
    return {
      success: false,
      error: error.message,
      valid: false
    };
  }
}

/**
 * Maps form data to XML structure according to Form 31 schema
 * @private
 * @param {Object} content - Content section of XML document to populate
 * @param {Object} formData - Extracted form data
 */
function mapDataToXmlStructure(content, formData) {
  // Personal Information section
  content.personalInformation = {};
  
  // Add individual fields with proper null checks
  if (formData.fullName) {
    content.personalInformation.fullName = formData.fullName;
  }
  
  if (formData.dateOfBirth) {
    content.personalInformation.dateOfBirth = formatDate(formData.dateOfBirth);
  }
  
  if (formData.address) {
    content.personalInformation.address = {};
    const address = formData.address;
    
    if (address.street) content.personalInformation.address.street = address.street;
    if (address.city) content.personalInformation.address.city = address.city;
    if (address.province) content.personalInformation.address.province = address.province;
    if (address.postalCode) content.personalInformation.address.postalCode = address.postalCode;
    if (address.country) content.personalInformation.address.country = address.country;
  }
  
  // Financial Information section
  content.financialInformation = {};
  
  if (formData.income !== undefined) {
    content.financialInformation.income = {
      annual: formData.income.annual || 0,
      monthly: formData.income.monthly || 0
    };
  }
  
  if (formData.assets) {
    content.financialInformation.assets = [];
    
    // Handle assets as an array
    if (Array.isArray(formData.assets)) {
      formData.assets.forEach(asset => {
        const xmlAsset = {
          description: asset.description || '',
          value: asset.value || 0,
          type: asset.type || 'other'
        };
        content.financialInformation.assets.push(xmlAsset);
      });
    }
  }
  
  if (formData.liabilities) {
    content.financialInformation.liabilities = [];
    
    // Handle liabilities as an array
    if (Array.isArray(formData.liabilities)) {
      formData.liabilities.forEach(liability => {
        const xmlLiability = {
          creditor: liability.creditor || '',
          amount: liability.amount || 0,
          type: liability.type || 'other'
        };
        content.financialInformation.liabilities.push(xmlLiability);
      });
    }
  }
  
  // Other sections can be added as needed
  // ...
  
  // Certification section
  if (formData.certification) {
    content.certification = {
      signature: formData.certification.signature || '',
      date: formatDate(formData.certification.date)
    };
  }
}

/**
 * Format date for XML output
 * @private
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatDate(date) {
  if (!date) return '';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    logger.error(`Error formatting date: ${error.message}`, { date });
    return '';
  }
}

/**
 * Validate XML against XSD schema
 * @param {string} xmlData - XML string to validate
 * @param {string} schemaPath - Path to the XSD schema file
 * @returns {Promise<Object>} - Validation result
 */
async function validateXMLSchema(xmlData, schemaPath = null) {
  try {
    // Default schema path if not provided
    const xsdPath = schemaPath || path.join(process.cwd(), 'schema', 'form31.xsd');
    
    // Check if schema exists
    if (!fs.existsSync(xsdPath)) {
      logger.warn(`XML Schema not found at path: ${xsdPath}`);
      return {
        valid: false,
        errors: [{
          message: 'XML Schema file not found',
          line: 0,
          column: 0
        }]
      };
    }
    
    // Read XSD schema
    const xsdContent = await readFileAsync(xsdPath, 'utf8');
    
    // Parse XSD and XML for validation
    const xsdDoc = libxmljs.parseXml(xsdContent);
    const xmlDoc = libxmljs.parseXml(xmlData);
    
    // Validate
    const isValid = xmlDoc.validate(xsdDoc);
    
    if (!isValid) {
      // Get validation errors
      const errors = xmlDoc.validationErrors.map(err => ({
        message: err.message,
        line: err.line,
        column: err.column
      }));
      
      return {
        valid: false,
        errors
      };
    }
    
    return {
      valid: true,
      errors: []
    };
    
  } catch (error) {
    logger.error(`XML validation error: ${error.message}`, { error });
    
    return {
      valid: false,
      errors: [{
        message: `XML validation error: ${error.message}`,
        line: error.line || 0,
        column: error.column || 0
      }]
    };
  }
}

/**
 * Save XML to file with proper error handling
 * @param {string} xml - XML string
 * @param {string} documentId - Document ID
 * @param {string} outputDir - Output directory (optional)
 * @returns {Promise<string>} - Path to the saved file
 */
async function saveXmlToFile(xml, documentId, outputDir = null) {
  try {
    // Default output directory if not provided
    const xmlDir = outputDir || path.join(process.cwd(), 'output', 'xml');
    
    // Ensure output directory exists
    await mkdirAsync(xmlDir, { recursive: true });
    
    // Generate filename with timestamp to avoid collisions
    const timestamp = new Date().getTime();
    const filename = `${documentId}_${timestamp}.xml`;
    const outputPath = path.join(xmlDir, filename);
    
    // Write XML to file with proper UTF-8 encoding
    await writeFileAsync(outputPath, xml, 'utf8');
    
    logger.info(`XML saved to file: ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    logger.error(`Error saving XML to file: ${error.message}`, { error, documentId });
    throw new XMLGenerationError(`Failed to save XML file: ${error.message}`);
  }
}

/**
 * Process XML file to ensure compliance with ISED requirements
 * @param {string} xmlData - XML string to process
 * @returns {Promise<string>} - Processed XML string
 */
async function ensureISEDCompliance(xmlData) {
  try {
    // Parse XML to object
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedXml = await parser.parseStringPromise(xmlData);
    
    // Apply ISED compliance rules
    // 1. Check for required namespaces
    if (!parsedXml.document || !parsedXml.document.$ || 
        !parsedXml.document.$.xmlns) {
      
      // Fix namespace if missing
      if (!parsedXml.document) {
        parsedXml.document = {};
      }
      
      if (!parsedXml.document.$) {
        parsedXml.document.$ = {};
      }
      
      parsedXml.document.$ = {
        ...parsedXml.document.$,
        xmlns: 'http://ised-isde.canada.ca/form31/schema/1.0',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://ised-isde.canada.ca/form31/schema/1.0 form31.xsd'
      };
    }
    
    // 2. Check for required form attributes
    if (!parsedXml.document.form || !parsedXml.document.form.$) {
      if (!parsedXml.document.form) {
        parsedXml.document.form = {};
      }
      
      if (!parsedXml.document.form.$) {
        parsedXml.document.form.$ = {};
      }
      
      parsedXml.document.form.$ = {
        ...parsedXml.document.form.$,
        type: 'bankruptcy',
        'form-number': '31',
        version: '1.0'
      };
    }
    
    // 3. Ensure proper metadata
    if (!parsedXml.document.form.metadata) {
      parsedXml.document.form.metadata = {};
    }
    
    if (!parsedXml.document.form.metadata['generated-timestamp']) {
      parsedXml.document.form.metadata['generated-timestamp'] = new Date().toISOString();
    }
    
    if (!parsedXml.document.form.metadata['generation-system']) {
      parsedXml.document.form.metadata['generation-system'] = config.appName || 'PDF-to-XML-Converter';
    }
    
    // Convert back to XML
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' }
    });
    
    return builder.buildObject(parsedXml);
    
  } catch (error) {
    logger.error(`Error ensuring ISED compliance: ${error.message}`, { error });
    // Return original XML if processing fails
    return xmlData;
  }
}

module.exports = {
  generateXML,
  validateXMLSchema,
  saveXmlToFile,
  ensureISEDCompliance
};