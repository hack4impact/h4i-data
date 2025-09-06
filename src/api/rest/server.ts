import express from 'express';
import cors from 'cors';
import router from './routes'; // This now correctly imports your main router
import { env } from '../../config/server';
import { connectDB } from '../../config/database';
import {
  requestLogger,
  errorHandler,
  notFoundHandler,
  rateLimiter,
  helmetConfig,
} from '../../middleware';
import { logger } from '../../config/logger';

export const createRestApp = () => {
  const app = express();

  // Security middleware (apply first)
  app.use(helmetConfig);
  app.use(rateLimiter);

  // Basic middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use(requestLogger);

  // Health check endpoint (before other routes)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'volunteer-management-backend-rest',
    });
  });

  // Use the main router for all API endpoints.
  app.use('/', router);

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const startServer = async () => {
  await connectDB();
  const app = createRestApp();

  app.listen(env.REST_PORT, () => {
    logger.info('REST API server started', {
      port: env.REST_PORT,
      url: `http://localhost:${env.REST_PORT}`,
      environment: env.NODE_ENV,
    });
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
