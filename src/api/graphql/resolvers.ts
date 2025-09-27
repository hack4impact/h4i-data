import { chapterResolvers } from './resolvers/chapters.resolvers';
import { sponsorResolvers } from './resolvers/sponsors.resolvers';
import { volunteerResolvers } from './resolvers/volunteers.resolvers';

// Merge multiple resolver objects here
export const resolvers = {
  Query: {
    ...chapterResolvers.Query,
    ...sponsorResolvers.Query,
    ...volunteerResolvers.Query,
  },
  Mutation: {
    ...chapterResolvers.Mutation,
    ...sponsorResolvers.Mutation,
    ...volunteerResolvers.Mutation,
  },
};
