// GraphQL server setup and configuration
// This file creates a standalone GraphQL server that can run independently or alongside REST API

import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { config } from '../config/server';

// Create Express app specifically for GraphQL endpoints
const app = express();

/**
 * Create executable GraphQL schema by combining type definitions and resolvers.
 * This schema defines:
 * - What queries and mutations are available
 * - How each field is resolved (what data is returned)
 * - Input/output types and validation
 */
const schema = makeExecutableSchema({
  typeDefs,    // GraphQL schema definition (queries, mutations, types)
  resolvers,   // Functions that fetch/modify data for each schema field
});

/**
 * Main GraphQL endpoint that handles all GraphQL requests.
 * Uses express-graphql middleware to:
 * - Parse GraphQL queries from request body
 * - Execute queries against the schema
 * - Return JSON responses
 * - Provide GraphiQL interface in development
 */
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    // Enable GraphiQL web interface for testing queries in development
    // This provides a browser-based query editor and documentation
    graphiql: config.NODE_ENV === 'development',
  })
);

/**
 * Simple health check endpoint to verify GraphQL server is running.
 * Useful for:
 * - Load balancer health checks
 * - Monitoring systems
 * - Quick server status verification
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'GraphQL API' });
});

/**
 * Starts the GraphQL server on the configured port.
 * This function:
 * - Binds the Express app to a port
 * - Sets up graceful shutdown handling
 * - Returns the server instance for external control
 * 
 * @returns HTTP server instance
 */
export async function startGraphQLServer() {
  const server = app.listen(config.GRAPHQL_PORT, () => {
    console.log(`GraphQL Server running on 
  http://localhost:${config.GRAPHQL_PORT}`);
    console.log(`GraphiQL interface: 
  http://localhost:${config.GRAPHQL_PORT}/graphql`);
  });

  // Register signal handler for graceful shutdown
  // Note: This is redundant if server is managed by main app.ts
  // but allows GraphQL server to run standalone if needed
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down GraphQL server gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  return server;
}

// Export Express app for testing or integration with other middleware
export { app };
