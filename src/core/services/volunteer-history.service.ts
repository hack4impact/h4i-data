import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createVolunteerHistorySchema,
  updateVolunteerHistorySchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateVolunteerHistoryInput = z.infer<typeof createVolunteerHistorySchema>;
type UpdateVolunteerHistoryInput = z.infer<typeof updateVolunteerHistorySchema>;

export async function getAllVolunteerHistory() {
  try {
    logger.info('Fetching all volunteer history');
    const history = await prisma.volunteer_history.findMany({
      orderBy: { effective_date: 'desc' },
    });

    logger.info('Successfully retrieved volunteer history', {
      count: history.length,
    });

    return history;
  } catch (error) {
    logger.error('Failed to fetch volunteer history', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve volunteer history');
  }
}

export async function getVolunteerHistoryById(id: string) {
  try {
    logger.info('Fetching volunteer history by ID', { historyId: id });

    const history = await prisma.volunteer_history.findUnique({
      where: { volunteer_history_id: id },
    });

    if (!history) {
      logger.warn('Volunteer history not found', { historyId: id });
      throw new NotFoundError('VolunteerHistory', id);
    }

    logger.info('Successfully retrieved volunteer history', { historyId: id });

    return history;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch volunteer history by ID', {
      historyId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve volunteer history');
  }
}

export async function createVolunteerHistory(
  data: CreateVolunteerHistoryInput
) {
  try {
    logger.info('Creating new volunteer history');

    const history = await prisma.volunteer_history.create({ data });

    logger.info('Successfully created volunteer history', {
      historyId: history.volunteer_history_id,
    });

    return history;
  } catch (error) {
    logger.error('Failed to create volunteer history', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create volunteer history');
  }
}

export async function updateVolunteerHistory(
  id: string,
  data: UpdateVolunteerHistoryInput
) {
  try {
    logger.info('Updating volunteer history', {
      historyId: id,
      updateData: data,
    });

    const history = await prisma.volunteer_history.update({
      where: { volunteer_history_id: id },
      data,
    });

    logger.info('Successfully updated volunteer history', { historyId: id });

    return history;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('VolunteerHistory', id);
    }

    logger.error('Failed to update volunteer history', {
      historyId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update volunteer history');
  }
}

export async function deleteVolunteerHistory(id: string) {
  try {
    logger.info('Deleting volunteer history', { historyId: id });

    const history = await prisma.volunteer_history.delete({
      where: { volunteer_history_id: id },
    });

    logger.info('Successfully deleted volunteer history', { historyId: id });

    return history;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('VolunteerHistory', id);
    }

    logger.error('Failed to delete volunteer history', {
      historyId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete volunteer history');
  }
}
