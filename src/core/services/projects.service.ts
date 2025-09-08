// src/core/services/project.service.ts
import { prisma } from '../../config/database';
import { createProjectSchema, updateProjectSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const getAllProjects = async () => {
  try {
    logger.info('Fetching all projects');
    const projects = await prisma.projects.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved projects', {
      count: projects.length,
    });

    return projects;
  } catch (error) {
    logger.error('Failed to fetch projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve projects');
  }
};

export const getProjectById = async (id: string) => {
  try {
    logger.info('Fetching project by ID', { projectId: id });

    const project = await prisma.projects.findUnique({
      where: { project_id: id },
    });

    if (!project) {
      logger.warn('Project not found', { projectId: id });
      throw new NotFoundError('Project', id);
    }

    logger.info('Successfully retrieved project', {
      projectId: id,
      projectName: project.name,
    });

    return project;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch project by ID', {
      projectId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project');
  }
};

export const createProject = async (data: CreateProjectInput) => {
  try {
    logger.info('Creating new project', {
      projectName: data.name,
      projectData: data,
    });

    const project = await prisma.projects.create({ data });

    logger.info('Successfully created project', {
      projectId: project.project_id,
      projectName: project.name,
    });

    return project;
  } catch (error) {
    logger.error('Failed to create project', {
      projectData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create project');
  }
};

export const updateProject = async (id: string, data: UpdateProjectInput) => {
  try {
    logger.info('Updating project', {
      projectId: id,
      updateData: data,
    });

    const project = await prisma.projects.update({
      where: { project_id: id },
      data,
    });

    logger.info('Successfully updated project', {
      projectId: id,
      projectName: project.name,
    });

    return project;
  } catch (error) {
    logger.error('Failed to update project', {
      projectId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if project doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Project', id);
    }

    throw new DatabaseError('Failed to update project');
  }
};

export const deleteProject = async (id: string) => {
  try {
    logger.info('Deleting project', { projectId: id });

    const project = await prisma.projects.delete({
      where: { project_id: id },
    });

    logger.info('Successfully deleted project', {
      projectId: id,
      projectName: project.name,
    });

    return project;
  } catch (error) {
    logger.error('Failed to delete project', {
      projectId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if project doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Project', id);
    }

    throw new DatabaseError('Failed to delete project');
  }
};
