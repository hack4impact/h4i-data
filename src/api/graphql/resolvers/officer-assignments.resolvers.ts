import {
  createOfficerAssignment,
  createOfficerAssignmentSchema,
  deleteOfficerAssignment,
  getAllOfficerAssignments,
  getOfficerAssignmentById,
  updateOfficerAssignment,
  updateOfficerAssignmentSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateOfficerAssignmentInput = z.infer<
  typeof createOfficerAssignmentSchema
>;
type UpdateOfficerAssignmentInput = z.infer<
  typeof updateOfficerAssignmentSchema
>;

export const officerAssignmentResolvers = {
  Query: {
    officerAssignments: () => getAllOfficerAssignments(),
    officerAssignment: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getOfficerAssignmentById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createOfficerAssignment: (
      _parent: unknown,
      { input }: { input: CreateOfficerAssignmentInput }
    ) => {
      const validatedInput = createOfficerAssignmentSchema.parse(input);
      return createOfficerAssignment(validatedInput);
    },
    updateOfficerAssignment: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateOfficerAssignmentInput }
    ) => {
      const validatedInput = updateOfficerAssignmentSchema.parse(input);
      return updateOfficerAssignment(id, validatedInput);
    },
    deleteOfficerAssignment: (_parent: unknown, { id }: { id: string }) => {
      return deleteOfficerAssignment(id);
    },
  },
};
