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

// Types for filtering
export type ProjectLengthSortOption =
  | 'LONGEST_TO_SHORTEST'
  | 'SHORTEST_TO_LONGEST';

export interface GetProjectsFilters {
  statuses?: string[];
  lengthSort?: ProjectLengthSortOption;
}

// Type for project with nonprofit_chapter_project relations
type ProjectWithRelations = Prisma.projectsGetPayload<{
  include: {
    nonprofit_chapter_project: {
      select: {
        start_date: true;
        end_date: true;
        project_status: true;
      };
    };
  };
}>;

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

/**
 * Calculate the maximum project length in days from all nonprofit_chapter_project entries
 * For ongoing projects (end_date is null), use current date
 */
function calculateProjectLength(project: ProjectWithRelations): number {
  const now = new Date();
  let maxLength = 0;

  if (
    !project.nonprofit_chapter_project ||
    project.nonprofit_chapter_project.length === 0
  ) {
    return 0;
  }

  for (const ncp of project.nonprofit_chapter_project) {
    const endDate = ncp.end_date || now; // Ongoing projects use current date
    const length = Math.floor(
      (endDate.getTime() - ncp.start_date.getTime()) / (1000 * 60 * 60 * 24)
    ); // Days
    maxLength = Math.max(maxLength, length);
  }

  return maxLength;
}

/**
 * Check if a project matches the status filter
 * A project matches if any of its nonprofit_chapter_project entries has a matching status
 */
function matchesStatusFilter(
  project: ProjectWithRelations,
  statuses: string[]
): boolean {
  if (!statuses || statuses.length === 0) {
    return true;
  }

  // Normalize status strings to uppercase
  const normalizedStatuses = statuses.map((s) => s.toUpperCase());

  // If project has no nonprofit_chapter_project entries, it doesn't match any status filter
  if (
    !project.nonprofit_chapter_project ||
    project.nonprofit_chapter_project.length === 0
  ) {
    return false;
  }

  // Check if any entry matches the status filter
  return project.nonprofit_chapter_project.some((ncp) =>
    normalizedStatuses.includes(ncp.project_status)
  );
}

/**
 * Sort projects by calculated length
 */
function sortProjectsByLength(
  projects: ProjectWithRelations[],
  sortOption: ProjectLengthSortOption
): ProjectWithRelations[] {
  const projectsWithLength = projects.map((p) => ({
    project: p,
    length: calculateProjectLength(p),
  }));

  projectsWithLength.sort((a, b) => {
    if (sortOption === 'LONGEST_TO_SHORTEST') {
      return b.length - a.length;
    } else {
      return a.length - b.length;
    }
  });

  return projectsWithLength.map((p) => p.project);
}

/**
 * Get projects with optional filtering and sorting
 */
export async function getProjectsWithFilters(
  filters: GetProjectsFilters = {}
): Promise<ProjectWithRelations[]> {
  try {
    const { statuses, lengthSort } = filters;

    logger.info('Fetching projects with filters', { filters });

    // Fetch projects with related nonprofit_chapter_project data
    const projects = await prisma.projects.findMany({
      include: {
        nonprofit_chapter_project: {
          select: {
            start_date: true,
            end_date: true,
            project_status: true,
          },
        },
      },
      orderBy: { created_at: 'desc' }, // Default ordering
    });

    logger.info('Successfully retrieved projects', {
      count: projects.length,
    });

    // Apply status filter
    let filteredProjects = projects;
    if (statuses && statuses.length > 0) {
      filteredProjects = projects.filter((project) =>
        matchesStatusFilter(project, statuses)
      );

      logger.info('Applied status filter', {
        statuses,
        beforeCount: projects.length,
        afterCount: filteredProjects.length,
      });
    }

    // Apply length sorting
    if (lengthSort) {
      filteredProjects = sortProjectsByLength(filteredProjects, lengthSort);

      logger.info('Applied length sort', {
        sortOption: lengthSort,
        count: filteredProjects.length,
      });
    }

    logger.info('Successfully retrieved and filtered projects', {
      count: filteredProjects.length,
      filtersApplied: {
        statusFilter: statuses && statuses.length > 0,
        lengthSort: !!lengthSort,
      },
    });

    return filteredProjects;
  } catch (error) {
    logger.error('Failed to fetch projects with filters', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filters,
    });
    throw new DatabaseError('Failed to retrieve projects');
  }
}
