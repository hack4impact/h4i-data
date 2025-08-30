// REST API server setup and configuration  
// This file creates a standalone REST API server that can run independently or alongside GraphQL

import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { config } from '../config/server';

// Create Express app specifically for REST API endpoints
const app = express();

/**
 * Middleware setup for REST API server.
 * Middleware runs in order, so placement matters for request processing.
 */

// Enable CORS (Cross-Origin Resource Sharing) for all routes
// Allows frontend applications on different domains to access this API
app.use(cors());

// Parse JSON request bodies with size limit
// 10mb limit accommodates file uploads or large data payloads
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data (extended: true allows nested objects)
// Useful for HTML form submissions or certain client libraries
app.use(express.urlencoded({ extended: true }));

/**
 * Development-only request logging middleware.
 * Logs every incoming request with method, path, and timestamp.
 * Only enabled in development to avoid cluttering production logs.
 */
if (config.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

/**
 * Mount all API routes under /api prefix.
 * This keeps API endpoints organized and allows for versioning.
 * All volunteer routes will be available at /api/volunteers/*
 */
app.use('/api', apiRoutes);

/**
 * Root endpoint that provides API information and documentation.
 * Useful for:
 * - API discovery (what endpoints are available)
 * - Health checking at the application level
 * - Providing links to documentation
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Volunteer Management REST API',
    version: '1.0.0',
    endpoints: {
      volunteers: '/api/volunteers',  // Main volunteer CRUD operations
      health: '/api/health',          // Health check endpoint
    },
  });
});

/**
 * Error handling middleware (must be last).
 * Order matters: notFoundHandler catches unmatched routes,
 * errorHandler catches all thrown errors from other middleware/routes.
 */
app.use(notFoundHandler);  // Handles 404 for unmatched routes
app.use(errorHandler);     // Handles all other errors with proper HTTP status codes

/**
 * Starts the REST API server on the configured port.
 * This function:
 * - Binds the Express app to a port
 * - Sets up graceful shutdown handling
 * - Returns the server instance for external control
 * 
 * @returns HTTP server instance
 */
export async function startRestServer() {
  const server = app.listen(config.REST_PORT, () => {
    console.log(
      `REST API Server running on http://localhost:${config.REST_PORT}`
    );
    console.log(`API Documentation: http://localhost:${config.REST_PORT}/api`);
  });

  // Register signal handler for graceful shutdown
  // Note: This is redundant if server is managed by main app.ts
  // but allows REST server to run standalone if needed
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down REST server gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  return server;
}

// Export Express app for testing or integration with other middleware
export { app };
