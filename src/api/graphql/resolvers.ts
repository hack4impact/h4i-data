import { chapterResolvers } from './resolvers/chapters.resolvers';
import { sponsorResolvers } from './resolvers/sponsors.resolvers';
import { volunteerResolvers } from './resolvers/volunteers.resolvers';
import { contactResolvers } from './resolvers/contacts.resolvers';
import { roleResolvers } from './resolvers/roles.resolvers';
import { projectResolvers } from './resolvers/projects.resolvers';
import { nonprofitResolvers } from './resolvers/nonprofits.resolvers';

// Merge multiple resolver objects here
export const resolvers = {
  Query: {
    ...chapterResolvers.Query,
    ...sponsorResolvers.Query,
    ...volunteerResolvers.Query,
    ...contactResolvers.Query,
    ...roleResolvers.Query,
    ...projectResolvers.Query,
    ...nonprofitResolvers.Query,
  },
  Mutation: {
    ...chapterResolvers.Mutation,
    ...sponsorResolvers.Mutation,
    ...volunteerResolvers.Mutation,
    ...contactResolvers.Mutation,
    ...roleResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...nonprofitResolvers.Mutation,
  },
};
