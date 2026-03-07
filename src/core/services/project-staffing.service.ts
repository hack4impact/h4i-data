import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createProjectStaffingSchema,
  updateProjectStaffingSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateProjectStaffingInput = z.infer<typeof createProjectStaffingSchema>;
type UpdateProjectStaffingInput = z.infer<typeof updateProjectStaffingSchema>;

export async function getAllProjectStaffing() {
  try {
    logger.info('Fetching all project staffing');
    const staffing = await prisma.project_staffing.findMany({
      orderBy: { start_date: 'desc' },
    });

    logger.info('Successfully retrieved project staffing', {
      count: staffing.length,
    });

    return staffing;
  } catch (error) {
    logger.error('Failed to fetch project staffing', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project staffing');
  }
}

export async function getProjectStaffingById(id: string) {
  try {
    logger.info('Fetching project staffing by ID', { staffingId: id });

    const staffing = await prisma.project_staffing.findUnique({
      where: { staffing_id: id },
    });

    if (!staffing) {
      logger.warn('Project staffing not found', { staffingId: id });
      throw new NotFoundError('ProjectStaffing', id);
    }

    logger.info('Successfully retrieved project staffing', {
      staffingId: id,
    });

    return staffing;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch project staffing by ID', {
      staffingId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project staffing');
  }
}

export async function createProjectStaffing(data: CreateProjectStaffingInput) {
  try {
    logger.info('Creating new project staffing');

    const staffing = await prisma.project_staffing.create({ data });

    logger.info('Successfully created project staffing', {
      staffingId: staffing.staffing_id,
    });

    return staffing;
  } catch (error) {
    logger.error('Failed to create project staffing', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create project staffing');
  }
}

export async function updateProjectStaffing(
  id: string,
  data: UpdateProjectStaffingInput
) {
  try {
    logger.info('Updating project staffing', {
      staffingId: id,
      updateData: data,
    });

    const staffing = await prisma.project_staffing.update({
      where: { staffing_id: id },
      data,
    });

    logger.info('Successfully updated project staffing', { staffingId: id });

    return staffing;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectStaffing', id);
    }

    logger.error('Failed to update project staffing', {
      staffingId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update project staffing');
  }
}

export async function deleteProjectStaffing(id: string) {
  try {
    logger.info('Deleting project staffing', { staffingId: id });

    const staffing = await prisma.project_staffing.delete({
      where: { staffing_id: id },
    });

    logger.info('Successfully deleted project staffing', { staffingId: id });

    return staffing;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectStaffing', id);
    }

    logger.error('Failed to delete project staffing', {
      staffingId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete project staffing');
  }
}
