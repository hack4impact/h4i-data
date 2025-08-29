import { GraphQLDate } from "graphql-iso-date";
import { volunteerResolvers } from "./volunteerResolvers";

export const resolvers = {
  // scalar resolvers
  Date: GraphQLDate,

  // combine all feature resolvers
  Query: {
    ...volunteerResolvers.Query,
  },

  Mutation: {
    ...volunteerResolvers.Mutation,
  },
};

export * from "./volunteerResolvers";
