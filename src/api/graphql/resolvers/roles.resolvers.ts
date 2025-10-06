import {
  createRole,
  createRoleSchema,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
  updateRoleSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateRoleInput = z.infer<typeof createRoleSchema>;
type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const roleResolvers = {
  Query: {
    roles: () => getAllRoles(),
    role: async (_parent: unknown, { id }: { id: string }) => {
      const role = await getRoleById(id);
      if (!role) {
        throw new GraphQLError(
          'Role not found',
          undefined, // nodes
          undefined, // source
          undefined, // positions
          undefined, // path
          undefined, // originalError
          { code: 'NOT_FOUND' } // extensions
        );
      }
      return role;
    },
  },
  Mutation: {
    createRole: (_parent: unknown, { input }: { input: CreateRoleInput }) => {
      const validatedInput = createRoleSchema.parse(input);
      return createRole(validatedInput);
    },
    updateRole: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateRoleInput }
    ) => {
      const validatedInput = updateRoleSchema.parse(input);
      return updateRole(id, validatedInput);
    },
    deleteRole: (_parent: unknown, { id }: { id: string }) => {
      return deleteRole(id);
    },
  },
};
