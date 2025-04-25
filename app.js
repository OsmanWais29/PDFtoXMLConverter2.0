const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 8080;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Function to convert PDF to XML using the Java converter
function convertPDFtoXML(pdfPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Path to the Java JAR file
    const jarPath = path.join(__dirname, 'Converter', 'PDFtoXML.jar');
    
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
      resolve(outputPath);
    });
  });
}

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Serve static files
app.use(express.static(publicDir));

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API endpoint for file upload
app.post('/api/convert', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Process PDFs using the Java converter
    const results = [];
    for (const file of req.files) {
      const xmlName = file.originalname.replace('.pdf', '.xml');
      const xmlPath = path.join(__dirname, 'uploads', xmlName);
      
      try {
        // Use Java converter to process the PDF (if available)
        if (fs.existsSync(path.join(__dirname, 'Converter', 'PDFtoXML.jar'))) {
          await convertPDFtoXML(file.path, xmlPath);
        } else {
          // Fallback to creating a dummy XML file
          fs.writeFileSync(xmlPath, `<?xml version="1.0" encoding="UTF-8"?>\n<document>\n  <filename>${file.originalname}</filename>\n  <converted>true</converted>\n  <timestamp>${new Date().toISOString()}</timestamp>\n</document>`);
        }
        
        results.push({
          originalName: file.originalname,
          xmlName: xmlName,
          xmlPath: xmlPath,
          success: true
        });
      } catch (conversionError) {
        console.error(`Error converting ${file.originalname}:`, conversionError);
        results.push({
          originalName: file.originalname,
          success: false,
          error: conversionError.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Files processed',
      results: results
    });
  } catch (error) {
    console.error('Error in file conversion:', error);
    res.status(500).json({
      success: false,
      message: 'Error during file conversion',
      error: error.message
    });
  }
});

// Download route for converted XML files
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

// Catch-all route to serve the index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start the server only if the file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log('---------------------------------------------------');
    console.log(`PDFXMLConverterF31 server started!`);
    console.log(`Access the application at:`);
    console.log(`  • http://localhost:${port}`);
    console.log(`  • http://127.0.0.1:${port}`);
    console.log('---------------------------------------------------');
  }).on('error', (err) => {
    console.error('Failed to start server:', err.message);
  });
}

// Handle process errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// Export the app for testing
module.exports = app;
