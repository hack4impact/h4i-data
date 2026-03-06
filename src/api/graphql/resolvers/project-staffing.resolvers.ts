import {
  createProjectStaffing,
  createProjectStaffingSchema,
  deleteProjectStaffing,
  getAllProjectStaffing,
  getProjectStaffingById,
  updateProjectStaffing,
  updateProjectStaffingSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateProjectStaffingInput = z.infer<typeof createProjectStaffingSchema>;
type UpdateProjectStaffingInput = z.infer<typeof updateProjectStaffingSchema>;

export const projectStaffingResolvers = {
  Query: {
    projectStaffings: () => getAllProjectStaffing(),
    projectStaffing: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getProjectStaffingById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
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
