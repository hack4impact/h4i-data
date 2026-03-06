import express from 'express';
import { createRestApp } from './api/rest/server';
import { createGraphqlApp } from './api/graphql/server';
import { env } from './config/server';
import { connectDB, disconnectDB } from './config/database';
import { logger } from './config/logger';

async function startServer() {
  await connectDB();

  const app = express();

  // Mount the REST API
  const restApp = createRestApp();
  app.use('/api/rest', restApp);

  // Mount the GraphQL API
  const graphqlApp = createGraphqlApp();
  app.use('/api/graphql', graphqlApp);

  const port = process.env.PORT || env.PORT || 3001;
  const server = app.listen(port, () => {
    logger.info('Integrated server started', {
      port: env.PORT,
      rest: `http://localhost:${env.PORT}/api/rest`,
      graphql: `http://localhost:${env.PORT}/api/graphql`,
    });
  });

  // --- Graceful shutdown logic ---
  async function shutdown(signal: string) {
    logger.info('Shutting down gracefully', { signal });

    // 1. Stop the server from accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');

      // 2. Disconnect from the database
      await disconnectDB();

      // 3. Exit the process
      process.exit(0);
    });
  }

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
