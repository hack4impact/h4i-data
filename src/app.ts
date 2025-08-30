// src/app.ts
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import { createRestApp } from './api/rest/server';
import { createGraphQLServer } from './api/graphql/server';
import { env } from './config/server';
import { connectDB } from './config/database';

const startServer = async () => {
  await connectDB();

  const app = express();

  // Mount REST API
  const restApp = createRestApp();
  app.use('/api/rest', restApp);

  // Mount GraphQL API
  const graphQLServer = createGraphQLServer();
  await graphQLServer.start();
  app.use('/api/graphql', express.json(), expressMiddleware(graphQLServer));

  app.listen(env.PORT, () => {
    console.log(`Server ready at http://localhost:${env.PORT}`);
    console.log(`REST API at http://localhost:${env.PORT}/api/rest`);
    console.log(`GraphQL API at http://localhost:${env.PORT}/api/graphql`);
  });
};

startServer();
