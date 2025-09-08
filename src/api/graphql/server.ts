import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { env } from '../../config/server';
import { connectDB } from '../../config/database';
import { corsConfig } from '../../config/cors';
import {
  rateLimiter,
  helmetConfig,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from '../../middleware';
import { logger } from '../../config/logger';

// Keep the schema export for use in tests or other modules
export const graphqlSchema = makeExecutableSchema({ typeDefs, resolvers });

// Create a function that returns a configured GraphQL app
export const createGraphqlApp = () => {
  const app = express();

  // Security middleware (apply first)
  app.use(helmetConfig);
  app.use(rateLimiter);

  // Basic middleware
  app.use(cors(corsConfig));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'volunteer-management-backend-graphql',
    });
  });

  app.use(
    '/', // Mount at the root of this server
    graphqlHTTP({
      schema: graphqlSchema,
      graphiql: env.NODE_ENV === 'development',
    })
  );

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

// --- Add this startup logic ---
const startServer = async () => {
  await connectDB();
  const app = createGraphqlApp();
  app.listen(env.GRAPHQL_PORT, () => {
    logger.info('GraphQL API server started', {
      port: env.GRAPHQL_PORT,
      url: `http://localhost:${env.GRAPHQL_PORT}`,
      environment: env.NODE_ENV,
    });
  });
};

// This makes the file runnable
if (process.env.NODE_ENV !== 'test') {
  // Prevent server from starting during tests
  startServer();
}
