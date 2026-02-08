import { prisma } from '../../config/database';
import { createProjectSchema, updateProjectSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define types based on Zod schemas for better type safety
type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Types for filtering and sorting
export type ProjectSortOption = 'MOST_RECENT';

export interface GetProjectsFilters {
  chapterNames?: string[];
  sort?: ProjectSortOption[];
}

/**
 * Helper function to get the latest start_date from nonprofit_chapter_project
 */
function getLatestStartDate(ncpRecords: { start_date: Date }[]): Date | null {
  if (ncpRecords.length === 0) return null;
  return ncpRecords.reduce(
    (latest, record) => {
      const startDate = new Date(record.start_date);
      return !latest || startDate > latest ? startDate : latest;
    },
    null as Date | null
  );
}

/**
 * Get projects with optional filtering by chapter name and sorting by Most Recent
 */
export async function getProjectsWithFilters(filters: GetProjectsFilters = {}) {
  try {
    const { chapterNames, sort } = filters;

    logger.info('Fetching projects with filters', { filters });

    // Convert chapter names to chapter IDs
    let chapterIds: string[] | undefined;
    if (chapterNames && chapterNames.length > 0) {
      const chapters = await prisma.chapters.findMany({
        where: { name: { in: chapterNames } },
        select: { chapter_id: true },
      });
      chapterIds = chapters.map((c) => c.chapter_id);
      if (chapterIds.length === 0) {
        logger.info('No matching chapters found for names', {
          chapterNames,
        });
        return [];
      }
    }

    // Build Prisma where clause
    const where: Prisma.projectsWhereInput = {};
    if (chapterIds && chapterIds.length > 0) {
      where.nonprofit_chapter_project = {
        some: {
          chapter_id: {
            in: chapterIds,
          },
        },
      };
    }

    // Fetch projects with related nonprofit_chapter_project records
    const projects = await prisma.projects.findMany({
      where,
      include: {
        nonprofit_chapter_project: {
          select: {
            start_date: true,
            chapter_id: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Apply sorting by Most Recent (nonprofit_chapter_project.start_date descending)
    let result = projects;
    if (sort && sort.includes('MOST_RECENT')) {
      result = [...projects].sort((a, b) => {
        const aDate =
          getLatestStartDate(a.nonprofit_chapter_project)?.getTime() ??
          -Infinity;
        const bDate =
          getLatestStartDate(b.nonprofit_chapter_project)?.getTime() ??
          -Infinity;
        return bDate - aDate; // descending: most recent first
      });
    }

    logger.info('Successfully retrieved and filtered projects', {
      count: result.length,
    });

    return result;
  } catch (error) {
    logger.error('Failed to fetch projects with filters', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve projects');
  }
}

export async function getAllProjects() {
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
}

export async function getProjectById(id: string) {
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
}

export async function createProject(data: CreateProjectInput) {
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
}

export async function updateProject(id: string, data: UpdateProjectInput) {
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
}

export async function deleteProject(id: string) {
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
}
