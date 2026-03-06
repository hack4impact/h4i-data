import {
  createProjectEngagement,
  createProjectEngagementSchema,
  deleteProjectEngagement,
  getAllProjectEngagements,
  getProjectEngagementById,
  updateProjectEngagement,
  updateProjectEngagementSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
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
      try {
        return await getProjectEngagementById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
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
