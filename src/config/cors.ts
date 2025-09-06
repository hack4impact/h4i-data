import { CorsOptions } from 'cors';
import { env } from './server';
import { logger } from './logger';

const getAllowedOrigins = (): string[] => {
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

  // Default production origins
  if (env.NODE_ENV === 'production') {
    // TODO: Add production frontend URLs here
    // origins.push(
    //   'https://yourdomain.com',
    //   'https://www.yourdomain.com'
    // );
  }

  // If we need staging environment, add 'staging' to the NODE_ENV enum
  // in src/config/server.ts and uncomment the following:
  // if (env.NODE_ENV === 'staging') {
  //   origins.push('https://staging.yourdomain.com');
  // }

  logger.info('CORS configuration initialized', {
    environment: env.NODE_ENV,
    allowedOrigins: origins,
    count: origins.length,
  });

  return origins;
};

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from unauthorized origin', {
        blockedOrigin: origin,
        allowedOrigins,
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
