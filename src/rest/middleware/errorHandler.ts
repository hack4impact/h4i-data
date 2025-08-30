import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// error handler middleware
export const errorHandler = (err: ApiError, req: Request, res: Response) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  // default to 500 server error
  let statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // handle specific error types
  if (err.message.includes('not found')) {
    statusCode = 404;
  } else if (
    err.message.includes('validation') ||
    err.message.includes('required')
  ) {
    statusCode = 400;
  } else if (
    err.message.includes('duplicate') ||
    err.message.includes('already exists')
  ) {
    statusCode = 409;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler for routes that don't exist
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

// async error wrapper
export const asyncHandler =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
