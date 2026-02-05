import {
  createOfficerRole,
  createOfficerRoleSchema,
  deleteOfficerRole,
  getAllOfficerRoles,
  getOfficerRoleById,
  updateOfficerRole,
  updateOfficerRoleSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

type CreateOfficerRoleInput = z.infer<typeof createOfficerRoleSchema>;
type UpdateOfficerRoleInput = z.infer<typeof updateOfficerRoleSchema>;

export const officerRoleResolvers = {
  Query: {
    officerRoles: () => getAllOfficerRoles(),
    officerRole: async (_parent: unknown, { id }: { id: string }) => {
      const role = await getOfficerRoleById(id);
      if (!role) {
        throw new GraphQLError(
          'Officer role not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return role;
    },
  },
  Mutation: {
    createOfficerRole: (
      _parent: unknown,
      { input }: { input: CreateOfficerRoleInput }
    ) => {
      const validatedInput = createOfficerRoleSchema.parse(input);
      return createOfficerRole(validatedInput);
    },
    updateOfficerRole: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateOfficerRoleInput }
    ) => {
      const validatedInput = updateOfficerRoleSchema.parse(input);
      return updateOfficerRole(id, validatedInput);
    },
    deleteOfficerRole: (_parent: unknown, { id }: { id: string }) => {
      return deleteOfficerRole(id);
    },
  },
};
