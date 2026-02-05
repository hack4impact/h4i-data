import {
  createOfficerAssignment,
  createOfficerAssignmentSchema,
  deleteOfficerAssignment,
  getAllOfficerAssignments,
  getOfficerAssignmentById,
  updateOfficerAssignment,
  updateOfficerAssignmentSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
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
      const assignment = await getOfficerAssignmentById(id);
      if (!assignment) {
        throw new GraphQLError(
          'Officer assignment not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return assignment;
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
