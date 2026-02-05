import {
  createProjectEngagement,
  createProjectEngagementSchema,
  deleteProjectEngagement,
  getAllProjectEngagements,
  getProjectEngagementById,
  updateProjectEngagement,
  updateProjectEngagementSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

type CreateProjectEngagementInput = z.infer<
  typeof createProjectEngagementSchema
>;
type UpdateProjectEngagementInput = z.infer<
  typeof updateProjectEngagementSchema
>;

export const projectEngagementResolvers = {
  Query: {
    projectEngagements: () => getAllProjectEngagements(),
    projectEngagement: async (_parent: unknown, { id }: { id: string }) => {
      const engagement = await getProjectEngagementById(id);
      if (!engagement) {
        throw new GraphQLError(
          'Project engagement not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return engagement;
    },
  },
  Mutation: {
    createProjectEngagement: (
      _parent: unknown,
      { input }: { input: CreateProjectEngagementInput }
    ) => {
      const validatedInput = createProjectEngagementSchema.parse(input);
      return createProjectEngagement(validatedInput);
    },
    updateProjectEngagement: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateProjectEngagementInput }
    ) => {
      const validatedInput = updateProjectEngagementSchema.parse(input);
      return updateProjectEngagement(id, validatedInput);
    },
    deleteProjectEngagement: (_parent: unknown, { id }: { id: string }) => {
      return deleteProjectEngagement(id);
    },
  },
};
