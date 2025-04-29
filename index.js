/**
 * PDF to XML Converter - Application Entry Point
 * 
 * This file serves as the main entry point for the Bankruptcy Form 31 PDF to XML Converter.
 * It initializes the Express application from src/app.js and starts the HTTP server.
 */
const { app, startServer } = require('./src/app');
const config = require('./src/config/app');
const logger = require('./src/utils/logger');

// Start the server using the configuration from config/app.js
startServer()
  .then(server => {
    logger.info('---------------------------------------------------');
    logger.info(`${config.appName} v${config.version} server started!`);
    logger.info(`Environment: ${config.env}`);
    logger.info(`Access the application at:`);
    logger.info(`  • ${config.baseUrl}`);
    logger.info('---------------------------------------------------');
  })
  .catch(error => {
    logger.error(`Failed to start server: ${error.message}`, { error });
    process.exit(1);
  });

// Handle unhandled promise rejections at the top level
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at top level', { reason, promise });
  // Don't exit the process here, just log the error
});