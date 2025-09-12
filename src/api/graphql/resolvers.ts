import { chapterResolvers } from './resolvers/chapters.resolvers';
import { sponsorResolvers } from './resolvers/sponsors.resolvers';

// Merge multiple resolver objects here
export const resolvers = {
  Query: {
    ...chapterResolvers.Query,
    ...sponsorResolvers.Query,
  },
  Mutation: {
    ...chapterResolvers.Mutation,
    ...sponsorResolvers.Mutation,
  },
};
