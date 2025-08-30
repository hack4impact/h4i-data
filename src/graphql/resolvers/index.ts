import { GraphQLScalarType } from 'graphql';
import { DateTimeResolver } from 'graphql-scalars';
import { volunteerResolvers } from './volunteerResolvers';

export const resolvers = {
  // scalar resolvers
  Date: DateTimeResolver as GraphQLScalarType,

  // combine all feature resolvers
  Query: {
    ...volunteerResolvers.Query,
  },

  Mutation: {
    ...volunteerResolvers.Mutation,
  },
};

export * from './volunteerResolvers';
