// Express middleware for error handling and async route wrapping
// This file provides centralized error handling for the REST API

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils';

/**
 * Extended Error interface for API-specific error properties.
 * Allows errors to carry HTTP status codes and operational flags.
 */
export interface ApiError extends Error {
  statusCode?: number;        // HTTP status code to return (e.g., 400, 404, 500)
  isOperational?: boolean;    // Whether this is an expected operational error
}

/**
 * Main error handling middleware for REST API.
 * This function:
 * - Logs error details for debugging/monitoring
 * - Maps different error types to appropriate HTTP status codes
 * - Returns consistent JSON error responses
 * - Includes stack traces only in development mode
 * 
 * @param err - The error object (could be any Error type)
 * @param req - Express request object (for logging context)
 * @param res - Express response object (to send error response)
 */
export const errorHandler = (err: ApiError, req: Request, res: Response) => {
  // Log comprehensive error details for debugging
  // Includes request context to help identify the source of errors
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  // Start with default 500 status code and error message
  let statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  /**
   * Error type mapping logic.
   * Maps different error patterns to appropriate HTTP status codes.
   * This provides consistent status codes across the API.
   */
  
  // Handle custom ValidationError class (thrown by our validation utilities)
  if (err instanceof ValidationError) {
    statusCode = 400;  // Bad Request - client sent invalid data
  }
  // Map common error message patterns to HTTP status codes
  // This allows service layer to throw descriptive errors without knowing HTTP specifics
  else if (message.includes('Validation failed')) {
    statusCode = 400;  // Bad Request - validation errors
  } else if (
    message.includes('not found') ||
    message.includes('does not exist')
  ) {
    statusCode = 404;  // Not Found - resource doesn't exist
  } else if (
    message.includes('already exists') ||
    message.includes('duplicate')
  ) {
    statusCode = 409;  // Conflict - resource already exists
  } else if (
    message.includes('Invalid') ||
    message.includes('required') ||
    message.includes('format')
  ) {
    statusCode = 400;  // Bad Request - invalid input format
  } else if (
    message.includes('Database error') ||
    message.includes('Failed to fetch') ||
    message.includes('Failed to create')
  ) {
    statusCode = 500;  // Internal Server Error - database/system issues
  }

  // Send consistent JSON error response
  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack trace only in development for debugging
    // Never expose stack traces in production (security risk)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler for unmatched routes.
 * This catches any requests to routes that don't exist and returns
 * a consistent 404 response with route information.
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

/**
 * Async handler wrapper for Express routes.
 * This utility function wraps async route handlers to automatically
 * catch rejected promises and pass them to Express error middleware.
 * 
 * Without this wrapper, async errors in route handlers would cause
 * unhandled promise rejections instead of being caught by error middleware.
 * 
 * @param fn - Async route handler function
 * @returns Express middleware function that handles promise rejections
 * 
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
