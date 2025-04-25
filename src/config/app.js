/**
 * Application configuration settings
 */
const path = require('path');

module.exports = {
  // Server settings
  port: process.env.PORT || 8080,
  
  // File upload settings
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    allowedTypes: ['application/pdf'],
  },
  
  // Paths
  paths: {
    uploads: path.join(process.cwd(), 'uploads'),
    output: path.join(process.cwd(), 'output'),
    converter: path.join(process.cwd(), 'Converter', 'PDFtoXML.jar'),
    schema: path.join(process.cwd(), 'schema'),
    public: path.join(process.cwd(), 'public'),
  },
  
  // XML schema configuration
  schema: {
    form31: 'form31.xsd'
  }
};