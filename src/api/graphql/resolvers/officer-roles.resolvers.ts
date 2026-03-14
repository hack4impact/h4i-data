import {
  createOfficerRole,
  createOfficerRoleSchema,
  deleteOfficerRole,
  getAllOfficerRoles,
  getOfficerRoleById,
  updateOfficerRole,
  updateOfficerRoleSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateOfficerRoleInput = z.infer<typeof createOfficerRoleSchema>;
type UpdateOfficerRoleInput = z.infer<typeof updateOfficerRoleSchema>;

export const officerRoleResolvers = {
  Query: {
    officerRoles: () => getAllOfficerRoles(),
    officerRole: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getOfficerRoleById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
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
