import { GraphQLDate } from "graphql-iso-date";
import { volunteerResolvers } from "./volunteerResolvers";

export const resolvers = {
  // Scalar resolvers
  Date: GraphQLDate,

  // Combine all feature resolvers
  Query: {
    ...volunteerResolvers.Query,
  },

  Mutation: {
    ...volunteerResolvers.Mutation,
  },
};

export * from "./volunteerResolvers";
