import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}

// Custom error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(`Database error: ${message}`, 500);
  }
}

// Error handler middleware
export function errorHandler(
  error: Error,
  req: RequestWithId,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    details = error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (error.code) {
      case 'P2002':
        message = 'A record with this data already exists';
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      default:
        message = 'Database operation failed';
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = 'Unknown database error occurred';
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    message = 'Database connection error';
  }

  // Log the error with full context
  const errorLog = {
    requestId: req.requestId,
    error: {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: {
        'user-agent': req.get('User-Agent'),
        'content-type': req.get('Content-Type'),
      },
      body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      params: Object.keys(req.params).length > 0 ? req.params : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
    },
    response: {
      statusCode,
    },
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
  };

  // Log based on severity
  if (statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else if (statusCode >= 400) {
    logger.warn('Client Error', errorLog);
  }

  // Prepare response
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse: Record<string, unknown> = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  };

  // Include additional details in development or for validation errors
  if (isDevelopment || statusCode === 400) {
    if (details) {
      errorResponse.details = details;
    }
    if (isDevelopment && error.stack) {
      errorResponse.stack = error.stack;
    }
  }

  res.status(statusCode).json(errorResponse);
}

// Async error wrapper to catch async errors
export function asyncHandler(
  fn: (req: RequestWithId, res: Response, next?: NextFunction) => Promise<void>
) {
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler for undefined routes
export function notFoundHandler(
  req: RequestWithId,
  res: Response,
  next: NextFunction
) {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
  next(error);
}
