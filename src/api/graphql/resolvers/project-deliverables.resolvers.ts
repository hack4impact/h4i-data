import {
  createProjectDeliverable,
  createProjectDeliverableSchema,
  deleteProjectDeliverable,
  getAllProjectDeliverables,
  getProjectDeliverableById,
  updateProjectDeliverable,
  updateProjectDeliverableSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
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
      const deliverable = await getProjectDeliverableById(id);
      if (!deliverable) {
        throw new GraphQLError(
          'Project deliverable not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return deliverable;
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
