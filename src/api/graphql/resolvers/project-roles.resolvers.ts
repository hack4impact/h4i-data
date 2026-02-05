import {
  createProjectRole,
  createProjectRoleSchema,
  deleteProjectRole,
  getAllProjectRoles,
  getProjectRoleById,
  updateProjectRole,
  updateProjectRoleSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

type CreateProjectRoleInput = z.infer<typeof createProjectRoleSchema>;
type UpdateProjectRoleInput = z.infer<typeof updateProjectRoleSchema>;

export const projectRoleResolvers = {
  Query: {
    projectRoles: () => getAllProjectRoles(),
    projectRole: async (_parent: unknown, { id }: { id: string }) => {
      const role = await getProjectRoleById(id);
      if (!role) {
        throw new GraphQLError(
          'Project role not found',
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
    createProjectRole: (
      _parent: unknown,
      { input }: { input: CreateProjectRoleInput }
    ) => {
      const validatedInput = createProjectRoleSchema.parse(input);
      return createProjectRole(validatedInput);
    },
    updateProjectRole: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateProjectRoleInput }
    ) => {
      const validatedInput = updateProjectRoleSchema.parse(input);
      return updateProjectRole(id, validatedInput);
    },
    deleteProjectRole: (_parent: unknown, { id }: { id: string }) => {
      return deleteProjectRole(id);
    },
  },
};
