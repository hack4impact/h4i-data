import {
  createProject,
  createProjectSchema,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectSchema,
} from '../../../core';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectResolvers = {
  Query: {
    projects: async (_parent: unknown, args: { sortOrder?: string }) => {
      const projects = await getAllProjects();

      if (!args.sortOrder) {
        return projects;
      }

      const order = (args.sortOrder || 'ASC').toUpperCase();

      return projects.sort((a, b) => {
        if (order === 'DESC') {
          return (b.name ?? '').localeCompare(a.name ?? '');
        }
        return (a.name ?? '').localeCompare(b.name ?? '');
      });
    },
    project: (_parent: unknown, args: { id: string }) => {
      return getProjectById(args.id);
    },
  },
  Mutation: {
    createProject: (_parent: unknown, args: { input: CreateProjectInput }) => {
      const validatedInput = createProjectSchema.parse(args.input);
      return createProject(validatedInput);
    },
    updateProject: (
      _parent: unknown,
      args: { id: string; input: UpdateProjectInput }
    ) => {
      const validatedInput = updateProjectSchema.parse(args.input);
      return updateProject(args.id, validatedInput);
    },
    deleteProject: (_parent: unknown, args: { id: string }) => {
      return deleteProject(args.id);
    },
  },
};
