import {
  createProject,
  createProjectSchema,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectResolvers = {
  Query: {
    projects: () => getAllProjects(),
    project: async (_parent: unknown, { id }: { id: string }) => {
      const project = await getProjectById(id);
      if (!project) {
        throw new GraphQLError(
          'Project not found',
          undefined, // nodes
          undefined, // source
          undefined, // positions
          undefined, // path
          undefined, // originalError
          { code: 'NOT_FOUND' } // extensions
        );
      }
      return project;
    },
  },
  Mutation: {
    createProject: (
      _parent: unknown,
      { input }: { input: CreateProjectInput }
    ) => {
      const validatedInput = createProjectSchema.parse(input);
      return createProject(validatedInput);
    },
    updateProject: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateProjectInput }
    ) => {
      const validatedInput = updateProjectSchema.parse(input);
      return updateProject(id, validatedInput);
    },
    deleteProject: (_parent: unknown, { id }: { id: string }) => {
      return deleteProject(id);
    },
  },
};
