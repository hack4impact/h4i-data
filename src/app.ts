import express from 'express';
import { createRestApp } from './api/rest/server';
import { createGraphqlApp } from './api/graphql/server';
import { env } from './config/server';
import { connectDB, disconnectDB } from './config/database'; // Import disconnectDB
import cors from 'cors';
import { corsConfig } from './config/cors';

async function startServer() {
  await connectDB();

  const app = express();
  // allows access to the api
  app.use(cors(corsConfig));

  // Mount the REST API
  const restApp = createRestApp();
  app.use('/api/rest', restApp);

  // Mount the GraphQL API
  const graphqlApp = createGraphqlApp();
  app.use('/api/graphql', graphqlApp);

  const port = process.env.PORT || env.PORT || 3001;
  const server = app.listen(port, () => {
    console.log(`Integrated server ready at http://localhost:${env.PORT}`);
    console.log(`REST API available at http://localhost:${env.PORT}/api/rest`);
    console.log(
      `GraphQL API available at http://localhost:${env.PORT}/api/graphql`
    );
  });

  // --- Graceful shutdown logic ---
  async function shutdown(signal: string) {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);

    // 1. Stop the server from accepting new connections
    server.close(async () => {
      console.log('HTTP server closed.');

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
