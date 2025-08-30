import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { createRestApp } from './api/rest/server';
import { graphqlSchema } from './api/graphql/server';
import { env } from './config/server';
import { connectDB } from './config/database';

const startServer = async () => {
  // Connect to the database
  await connectDB();

  const app = express();

  // Mount REST API
  const restApp = createRestApp();
  app.use('/api/rest', restApp);

  // Mount GraphQL API
  app.use(
    '/api/graphql',
    graphqlHTTP({
      schema: graphqlSchema,
      graphiql: env.NODE_ENV === 'development', // Enable GraphiQL in development
    })
  );

  app.listen(env.PORT, () => {
    console.log(`Server ready at http://localhost:${env.PORT}`);
    console.log(`REST API available at http://localhost:${env.PORT}/api/rest`);
    console.log(
      ` GraphQL API available at http://localhost:${env.PORT}/api/graphql`
    );
  });
};

startServer();
