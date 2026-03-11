import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createProjectDeliverableSchema,
  updateProjectDeliverableSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateProjectDeliverableInput = z.infer<
  typeof createProjectDeliverableSchema
>;
type UpdateProjectDeliverableInput = z.infer<
  typeof updateProjectDeliverableSchema
>;

export async function getAllProjectDeliverables() {
  try {
    logger.info('Fetching all project deliverables');
    const deliverables = await prisma.project_resources.findMany({
      orderBy: { deliverable_id: 'asc' },
    });

    logger.info('Successfully retrieved project deliverables', {
      count: deliverables.length,
    });

    return deliverables;
  } catch (error) {
    logger.error('Failed to fetch project deliverables', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project deliverables');
  }
}

export async function getProjectDeliverableById(id: string) {
  try {
    logger.info('Fetching project deliverable by ID', { deliverableId: id });

    const deliverable = await prisma.project_resources.findUnique({
      where: { deliverable_id: id },
    });

    if (!deliverable) {
      logger.warn('Project deliverable not found', { deliverableId: id });
      throw new NotFoundError('ProjectDeliverable', id);
    }

    logger.info('Successfully retrieved project deliverable', {
      deliverableId: id,
    });

    return deliverable;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch project deliverable by ID', {
      deliverableId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project deliverable');
  }
}

export async function createProjectDeliverable(
  data: CreateProjectDeliverableInput
) {
  try {
    logger.info('Creating new project deliverable');

    const deliverable = await prisma.project_resources.create({ data });

    logger.info('Successfully created project deliverable', {
      deliverableId: deliverable.deliverable_id,
    });

    return deliverable;
  } catch (error) {
    logger.error('Failed to create project deliverable', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create project deliverable');
  }
}

export async function updateProjectDeliverable(
  id: string,
  data: UpdateProjectDeliverableInput
) {
  try {
    logger.info('Updating project deliverable', {
      deliverableId: id,
      updateData: data,
    });

    const deliverable = await prisma.project_resources.update({
      where: { deliverable_id: id },
      data,
    });

    logger.info('Successfully updated project deliverable', {
      deliverableId: id,
    });

    return deliverable;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectDeliverable', id);
    }

    logger.error('Failed to update project deliverable', {
      deliverableId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update project deliverable');
  }
}

export async function deleteProjectDeliverable(id: string) {
  try {
    logger.info('Deleting project deliverable', { deliverableId: id });

    const deliverable = await prisma.project_resources.delete({
      where: { deliverable_id: id },
    });

    logger.info('Successfully deleted project deliverable', {
      deliverableId: id,
    });

    return deliverable;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectDeliverable', id);
    }

    logger.error('Failed to delete project deliverable', {
      deliverableId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete project deliverable');
  }
}
