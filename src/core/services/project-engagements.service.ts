import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createProjectEngagementSchema,
  updateProjectEngagementSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateProjectEngagementInput = z.infer<
  typeof createProjectEngagementSchema
>;
type UpdateProjectEngagementInput = z.infer<
  typeof updateProjectEngagementSchema
>;

export async function getAllProjectEngagements() {
  try {
    logger.info('Fetching all project engagements');
    const engagements = await prisma.project_engagements.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved project engagements', {
      count: engagements.length,
    });

    return engagements;
  } catch (error) {
    logger.error('Failed to fetch project engagements', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project engagements');
  }
}

export async function getProjectEngagementById(id: string) {
  try {
    logger.info('Fetching project engagement by ID', { engagementId: id });

    const engagement = await prisma.project_engagements.findUnique({
      where: { project_engagement_id: id },
    });

    if (!engagement) {
      logger.warn('Project engagement not found', { engagementId: id });
      throw new NotFoundError('ProjectEngagement', id);
    }

    logger.info('Successfully retrieved project engagement', {
      engagementId: id,
    });

    return engagement;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch project engagement by ID', {
      engagementId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project engagement');
  }
}

export async function createProjectEngagement(
  data: CreateProjectEngagementInput
) {
  try {
    logger.info('Creating new project engagement');

    const engagement = await prisma.project_engagements.create({ data });

    logger.info('Successfully created project engagement', {
      engagementId: engagement.project_engagement_id,
    });

    return engagement;
  } catch (error) {
    logger.error('Failed to create project engagement', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create project engagement');
  }
}

export async function updateProjectEngagement(
  id: string,
  data: UpdateProjectEngagementInput
) {
  try {
    logger.info('Updating project engagement', {
      engagementId: id,
      updateData: data,
    });

    const engagement = await prisma.project_engagements.update({
      where: { project_engagement_id: id },
      data,
    });

    logger.info('Successfully updated project engagement', {
      engagementId: id,
    });

    return engagement;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectEngagement', id);
    }

    logger.error('Failed to update project engagement', {
      engagementId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update project engagement');
  }
}

export async function deleteProjectEngagement(id: string) {
  try {
    logger.info('Deleting project engagement', { engagementId: id });

    const engagement = await prisma.project_engagements.delete({
      where: { project_engagement_id: id },
    });

    logger.info('Successfully deleted project engagement', {
      engagementId: id,
    });

    return engagement;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectEngagement', id);
    }

    logger.error('Failed to delete project engagement', {
      engagementId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete project engagement');
  }
}
