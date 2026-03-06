import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { randomUUID } from 'crypto';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}

// Generate unique request ID
const generateRequestId = (): string => randomUUID();

// Request logging middleware
export function requestLogger(
  req: RequestWithId,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  // Generate and attach request ID
  req.requestId =
    (req.headers['x-request-id'] as string) || generateRequestId();

  // Set request ID in response headers for tracing
  res.set('X-Request-ID', req.requestId);

  // Log incoming request
  logger.http('HTTP Request Started', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.socket.remoteAddress,
    contentLength: req.get('Content-Length'),
    contentType: req.get('Content-Type'),
    timestamp: new Date().toISOString(),
  });

  // Capture original res.end to log when response completes
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const responseSize = data ? JSON.stringify(data).length : 0;

    // Log response completion
    logger.http('HTTP Request Completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      responseSize: `${responseSize} bytes`,
      timestamp: new Date().toISOString(),
    });

    // Log slow requests as warnings
    if (duration > 1000) {
      logger.warn('Slow HTTP Request', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        responseTime: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    // Log client errors (4xx)
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logger.warn('Client Error Response', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        responseTime: `${duration}ms`,
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

// Skip logging for health check endpoints
export function skipHealthCheck(
  req: RequestWithId,
  res: Response,
  next: NextFunction
) {
  if (req.path === '/health' || req.path === '/ping') {
    return next();
  }
  return requestLogger(req, res, next);
}
