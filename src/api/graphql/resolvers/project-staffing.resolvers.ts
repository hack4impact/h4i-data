import {
  createProjectStaffing,
  createProjectStaffingSchema,
  deleteProjectStaffing,
  getAllProjectStaffing,
  getProjectStaffingById,
  updateProjectStaffing,
  updateProjectStaffingSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

type CreateProjectStaffingInput = z.infer<typeof createProjectStaffingSchema>;
type UpdateProjectStaffingInput = z.infer<typeof updateProjectStaffingSchema>;

export const projectStaffingResolvers = {
  Query: {
    projectStaffings: () => getAllProjectStaffing(),
    projectStaffing: async (_parent: unknown, { id }: { id: string }) => {
      const staffing = await getProjectStaffingById(id);
      if (!staffing) {
        throw new GraphQLError(
          'Project staffing not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return staffing;
    },
  },
  Mutation: {
    createProjectStaffing: (
      _parent: unknown,
      { input }: { input: CreateProjectStaffingInput }
    ) => {
      const validatedInput = createProjectStaffingSchema.parse(input);
      return createProjectStaffing(validatedInput);
    },
    updateProjectStaffing: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateProjectStaffingInput }
    ) => {
      const validatedInput = updateProjectStaffingSchema.parse(input);
      return updateProjectStaffing(id, validatedInput);
    },
    deleteProjectStaffing: (_parent: unknown, { id }: { id: string }) => {
      return deleteProjectStaffing(id);
    },
  },
};
