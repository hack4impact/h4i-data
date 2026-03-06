import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createOfficerAssignmentSchema,
  updateOfficerAssignmentSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateOfficerAssignmentInput = z.infer<
  typeof createOfficerAssignmentSchema
>;
type UpdateOfficerAssignmentInput = z.infer<
  typeof updateOfficerAssignmentSchema
>;

export async function getAllOfficerAssignments() {
  try {
    logger.info('Fetching all officer assignments');
    const assignments = await prisma.officer_assignments.findMany({
      orderBy: { start_date: 'desc' },
    });

    logger.info('Successfully retrieved officer assignments', {
      count: assignments.length,
    });

    return assignments;
  } catch (error) {
    logger.error('Failed to fetch officer assignments', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve officer assignments');
  }
}

export async function getOfficerAssignmentById(id: string) {
  try {
    logger.info('Fetching officer assignment by ID', { assignmentId: id });

    const assignment = await prisma.officer_assignments.findUnique({
      where: { assignment_id: id },
    });

    if (!assignment) {
      logger.warn('Officer assignment not found', { assignmentId: id });
      throw new NotFoundError('OfficerAssignment', id);
    }

    logger.info('Successfully retrieved officer assignment', {
      assignmentId: id,
    });

    return assignment;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch officer assignment by ID', {
      assignmentId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve officer assignment');
  }
}

export async function createOfficerAssignment(
  data: CreateOfficerAssignmentInput
) {
  try {
    logger.info('Creating new officer assignment', { assignmentData: data });

    const assignment = await prisma.officer_assignments.create({ data });

    logger.info('Successfully created officer assignment', {
      assignmentId: assignment.assignment_id,
    });

    return assignment;
  } catch (error) {
    logger.error('Failed to create officer assignment', {
      assignmentData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create officer assignment');
  }
}

export async function updateOfficerAssignment(
  id: string,
  data: UpdateOfficerAssignmentInput
) {
  try {
    logger.info('Updating officer assignment', {
      assignmentId: id,
      updateData: data,
    });

    const assignment = await prisma.officer_assignments.update({
      where: { assignment_id: id },
      data,
    });

    logger.info('Successfully updated officer assignment', {
      assignmentId: id,
    });

    return assignment;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('OfficerAssignment', id);
    }

    logger.error('Failed to update officer assignment', {
      assignmentId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update officer assignment');
  }
}

export async function deleteOfficerAssignment(id: string) {
  try {
    logger.info('Deleting officer assignment', { assignmentId: id });

    const assignment = await prisma.officer_assignments.delete({
      where: { assignment_id: id },
    });

    logger.info('Successfully deleted officer assignment', {
      assignmentId: id,
    });

    return assignment;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('OfficerAssignment', id);
    }

    logger.error('Failed to delete officer assignment', {
      assignmentId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete officer assignment');
  }
}
