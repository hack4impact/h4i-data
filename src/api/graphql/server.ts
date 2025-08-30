// src/api/graphql/server.ts
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';

export const createGraphQLServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
};
