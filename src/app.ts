// Main application entry point that orchestrates both GraphQL and REST servers
// This file handles the complete lifecycle: startup, running, and graceful shutdown

import { startGraphQLServer } from './graphql/server';
import { startRestServer } from './rest/server';
import { connectToDB, disconnectFromDB } from './config/database';
import { config } from './config/server';

/**
 * Main application function that starts both GraphQL and REST servers concurrently.
 * This allows the application to serve both APIs on different ports while sharing
 * the same database connection and service layer.
 */
async function startBothServers() {
  try {
    console.log('Starting application...');

    // Establish database connection once and share it across both servers
    // This ensures consistent database state and connection pooling
    await connectToDB();

    // Start both servers simultaneously using Promise.all for faster startup
    // GraphQL server runs on GRAPHQL_PORT, REST server on REST_PORT
    const [graphqlServer, restServer] = await Promise.all([
      startGraphQLServer(),
      startRestServer(),
    ]);

    // Log successful startup with accessible URLs for both APIs
    console.log('Both servers started successfully!');
    console.log(`GraphQL: http://localhost:${config.GRAPHQL_PORT}/graphql`);
    console.log(`REST API: http://localhost:${config.REST_PORT}/api`);

    /**
     * Graceful shutdown handler that properly closes both servers and database
     * connections when receiving termination signals (SIGTERM, SIGINT).
     * This prevents data corruption and ensures clean process termination.
     */
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      try {
        // Close both HTTP servers simultaneously to stop accepting new connections
        await Promise.all([
          new Promise((resolve) => graphqlServer.close(resolve)),
          new Promise((resolve) => restServer.close(resolve)),
        ]);

        // Close database connections after servers are shut down
        await disconnectFromDB();
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Register signal handlers for graceful shutdown
    // SIGTERM: sent by process managers (PM2, Docker, etc.)
    // SIGINT: sent by Ctrl+C in terminal
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    // If startup fails, ensure database is cleaned up before exiting
    console.error('Failed to start application:', error);
    await disconnectFromDB();
    process.exit(1);
  }
}

// Only start servers if this file is run directly (not imported as module)
// This allows the app to be imported for testing without auto-starting servers
if (require.main === module) {
  startBothServers();
}

export { startBothServers };
