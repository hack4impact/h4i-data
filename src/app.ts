// src/app.ts
import { startGraphQLServer } from './graphql/server';
import { startRestServer } from './rest/server';
import { connectToDB, disconnectFromDB } from './config/database';
import { config } from './config/server';

async function startApp() {
  try {
    console.log('Starting application...');

    await connectToDB();

    const [graphqlServer, restServer] = await Promise.all([
      startGraphQLServer(),
      startRestServer(),
    ]);

    console.log('Both servers started successfully!');
    console.log(`GraphQL: http://localhost:${config.GRAPHQL_PORT}/graphql`);
    console.log(`REST API: http://localhost:${config.REST_PORT}/api`);

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      try {
        await Promise.all([
          new Promise((resolve) => graphqlServer.close(resolve)),
          new Promise((resolve) => restServer.close(resolve)),
        ]);

        await disconnectFromDB();
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start application:', error);
    await disconnectFromDB();
    process.exit(1);
  }
}

if (require.main === module) {
  startApp();
}
