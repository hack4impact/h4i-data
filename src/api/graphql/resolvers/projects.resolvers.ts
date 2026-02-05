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

// Helper to convert Prisma Decimal fields to numbers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProject(project: any) {
  return {
    ...project,
    budget:
      project.budget && typeof project.budget.toNumber === 'function'
        ? project.budget.toNumber()
        : project.budget,
  };
}

export const projectResolvers = {
  Query: {
    projects: async (_parent: unknown, args: { sortOrder?: string }) => {
      const projects = await getAllProjects();

      if (!args.sortOrder) {
        return projects.map(serializeProject);
      }

      const order = (args.sortOrder || 'ASC').toUpperCase();

      const sortedProjects = projects.sort((a, b) => {
        if (order === 'DESC') {
          return (b.name ?? '').localeCompare(a.name ?? '');
        }
        return (a.name ?? '').localeCompare(b.name ?? '');
      });

      return sortedProjects.map(serializeProject);
    },
    project: async (_parent: unknown, args: { id: string }) => {
      const project = await getProjectById(args.id);
      if (!project) {
        throw new GraphQLError(
          'Project not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            code: 'NOT_FOUND',
          }
        );
      }
      return serializeProject(project);
    },
  },
  Mutation: {
    createProject: async (
      _parent: unknown,
      args: { input: CreateProjectInput }
    ) => {
      const validatedInput = createProjectSchema.parse(args.input);
      const project = await createProject(validatedInput);
      return serializeProject(project);
    },
    updateProject: async (
      _parent: unknown,
      args: { id: string; input: UpdateProjectInput }
    ) => {
      const validatedInput = updateProjectSchema.parse(args.input);
      const project = await updateProject(args.id, validatedInput);
      return serializeProject(project);
    },
    deleteProject: async (_parent: unknown, args: { id: string }) => {
      const project = await deleteProject(args.id);
      return serializeProject(project);
    },
  },
};
