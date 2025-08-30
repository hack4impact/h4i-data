import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { connectToDB, disconnectFromDB } from '../config/database';

const app = express();

// Create GraphQL schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true, // Enable GraphiQL interface
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'GraphQL API' });
});

const PORT = process.env.GRAPHQL_PORT || 3000;

// Start server function
export async function startGraphQLServer() {
  try {
    // Connect to database
    await connectToDB();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 GraphQL Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphiQL interface: http://localhost:${PORT}/graphql`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await disconnectFromDB();
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start GraphQL server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startGraphQLServer();
}

export { app };
