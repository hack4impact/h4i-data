import { PrismaClient } from '@prisma/client';
import { env } from './server';

// Build database URL with connection pool parameters
const buildDatabaseUrl = () => {
  const baseUrl = env.DATABASE_URL;
  const url = new URL(baseUrl);

  // Add connection pool parameters to the database URL
  url.searchParams.set('connection_limit', env.DB_CONNECTION_LIMIT.toString());
  url.searchParams.set('pool_timeout', env.DB_POOL_TIMEOUT.toString());

  return url.toString();
};

// Create Prisma client with connection pooling and enhanced configuration
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ],
  datasources: {
    db: {
      url: buildDatabaseUrl(),
    },
  },
});

// Query performance monitoring (only in development)
if (process.env.NODE_ENV === 'development') {
  // Import logger dynamically to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { logger } = require('./logger');

  prisma.$on('query', (e) => {
    if (e.duration > 1000) {
      logger.warn('Slow database query detected', {
        duration: `${e.duration}ms`,
        query: e.query.substring(0, 200) + (e.query.length > 200 ? '...' : ''),
        target: e.target,
      });
    }
  });
}

// Connection pool health check
export const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      healthy: true,
      responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

// Function to connect to the DB, used at startup
export const connectDB = async () => {
  try {
    await prisma.$connect();

    // Test the connection
    const health = await checkDatabaseHealth();

    // Import logger dynamically to avoid circular dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger } = require('./logger');

    logger.info('Database connected successfully', {
      responseTime: `${health.responseTime}ms`,
      connectionPool: {
        limit: env.DB_CONNECTION_LIMIT,
        timeout: `${env.DB_POOL_TIMEOUT}ms`,
      },
      environment: env.NODE_ENV,
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

//  isconnect from the DB, used at shutdown
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Failed to disconnect from the database', error);
  }
};
