import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { env } from '../../config/server';
import { connectDB } from '../../config/database';

// Keep the schema export for use in tests or other modules
export const graphqlSchema = makeExecutableSchema({ typeDefs, resolvers });

// Create a function that returns a configured GraphQL app
export const createGraphqlApp = () => {
  const app = express();
  app.use(
    '/', // Mount at the root of this server
    graphqlHTTP({
      schema: graphqlSchema,
      graphiql: env.NODE_ENV === 'development',
    })
  );
  return app;
};

// --- Add this startup logic ---
const startServer = async () => {
  await connectDB();
  const app = createGraphqlApp();
  app.listen(env.GRAPHQL_PORT, () => {
    console.log(
      `GraphQL API server listening at http://localhost:${env.GRAPHQL_PORT}`
    );
  });
};

// This makes the file runnable
if (process.env.NODE_ENV !== 'test') {
  // Prevent server from starting during tests
  startServer();
}
