/**
 * PDF to XML Converter Application
 * Main application entry point
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const config = require('./config/app');
const convertRoutes = require('./api/routes/convert');
const { errorConverter, errorHandler } = require('./utils/errorHandler');

// Initialize Express app
const app = express();

// Ensure required directories exist
const directories = [
  config.paths.uploads,
  config.paths.output,
  config.paths.public
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(config.paths.public));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', convertRoutes);

// Catch-all route to serve the index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(config.paths.public, 'index.html'));
});

// Error handling
app.use(errorConverter);
app.use(errorHandler);

// Start the server only if the file is run directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log('---------------------------------------------------');
    console.log(`PDFtoXMLConverter server started!`);
    console.log(`Access the application at:`);
    console.log(`  • http://localhost:${config.port}`);
    console.log(`  • http://127.0.0.1:${config.port}`);
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
