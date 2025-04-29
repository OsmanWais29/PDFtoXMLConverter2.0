/**
 * PDF-to-XML-Converter Application
 * Main application entry point
 */
const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const config = require('./config/app');
const logger = require('./utils/logger');
const routes = require('./api/routes');
const security = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const { metricsMiddleware } = require('./utils/metrics');

// Create Express application
const app = express();

// Initialize OpenTelemetry for distributed tracing
const { initializeOpenTelemetry } = require('./utils/metrics');
initializeOpenTelemetry();

// Ensure required directories exist
const requiredDirs = [
  config.uploadDir, 
  config.outputDir,
  config.tempDir
];

for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
}

// Configure security middleware
security.configureSecurityMiddleware(app);

// Set security HTTP headers
app.use(helmet());

// Set up CORS
app.use(cors());

// Configure request body parsing
app.use(express.json({ limit: config.maxUploadSize }));
app.use(express.urlencoded({ extended: true, limit: config.maxUploadSize }));

// Add compression for HTTP responses
app.use(compression());

// Clean data to prevent XSS attacks
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// Add metrics middleware
app.use(metricsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Configure request logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(logger.logRequest);
}

// Add security event logging
app.use(security.securityEventLogger);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Healthcheck endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.version,
    environment: config.env
  });
});

// API Routes - secured with API key authentication
app.use('/api', security.authenticateRequest, routes);

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource could not be found'
  });
});

// Global error handler
app.use(errorHandler);

// Database connection
async function connectToDatabase() {
  try {
    if (!config.mongoUri) {
      throw new Error('MongoDB connection URI is not provided');
    }
    
    // Configure MongoDB connection
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    };
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, mongoOptions);
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`, { error });
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    // Connect to database first
    await connectToDatabase();
    
    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`API available at ${config.baseUrl}/api`);
    });
    
    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      
      // Close HTTP server first, stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connection
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
        
        // Force close if it takes too long
        setTimeout(() => {
          logger.error('Could not close connections in time, forcing shutdown');
          process.exit(1);
        }, 10000);
      });
    };
    
    // Attach signal handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', { reason, promise });
    });
    
    return server;
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`, { error });
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
