import { CorsOptions } from 'cors';
import { env } from './server';
import { logger } from './logger';

function buildAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Always allow localhost in development
  if (env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000', // Common frontend port
      'http://127.0.0.1:3000' // Alternative localhost
    );
  }

  // Add custom origins from environment variable
  const customOrigins = process.env.CORS_ORIGINS;
  if (customOrigins) {
    const parsedOrigins = customOrigins
      .split(',')
      .map((origin) => origin.trim());
    origins.push(...parsedOrigins);
    logger.info('Added custom CORS origins from environment', {
      customOrigins: parsedOrigins,
    });
  }

  logger.info('CORS configuration initialized', {
    environment: env.NODE_ENV,
    allowedOrigins: origins,
    count: origins.length,
  });

  return origins;
}

const allowedOrigins = buildAllowedOrigins();

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from unauthorized origin', {
        blockedOrigin: origin,
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'], // Allow frontend to read request ID
};
