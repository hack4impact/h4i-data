import {
  createProjectDeliverable,
  createProjectDeliverableSchema,
  deleteProjectDeliverable,
  getAllProjectDeliverables,
  getProjectDeliverableById,
  updateProjectDeliverable,
  updateProjectDeliverableSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateProjectDeliverableInput = z.infer<
  typeof createProjectDeliverableSchema
>;
type UpdateProjectDeliverableInput = z.infer<
  typeof updateProjectDeliverableSchema
>;

export const projectDeliverableResolvers = {
  Query: {
    projectDeliverables: () => getAllProjectDeliverables(),
    projectDeliverable: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getProjectDeliverableById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createProjectDeliverable: (
      _parent: unknown,
      { input }: { input: CreateProjectDeliverableInput }
    ) => {
      const validatedInput = createProjectDeliverableSchema.parse(input);
      return createProjectDeliverable(validatedInput);
    },
    updateProjectDeliverable: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateProjectDeliverableInput }
    ) => {
      const validatedInput = updateProjectDeliverableSchema.parse(input);
      return updateProjectDeliverable(id, validatedInput);
    },
    deleteProjectDeliverable: (_parent: unknown, { id }: { id: string }) => {
      return deleteProjectDeliverable(id);
    },
  },
};
