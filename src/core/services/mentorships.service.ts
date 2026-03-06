import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createMentorshipSchema, updateMentorshipSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateMentorshipInput = z.infer<typeof createMentorshipSchema>;
type UpdateMentorshipInput = z.infer<typeof updateMentorshipSchema>;

export async function getAllMentorships() {
  try {
    logger.info('Fetching all mentorships');
    const mentorships = await prisma.mentorships.findMany({
      orderBy: { start_date: 'desc' },
    });

    logger.info('Successfully retrieved mentorships', {
      count: mentorships.length,
    });

    return mentorships;
  } catch (error) {
    logger.error('Failed to fetch mentorships', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve mentorships');
  }
}

export async function getMentorshipById(id: string) {
  try {
    logger.info('Fetching mentorship by ID', { mentorshipId: id });

    const mentorship = await prisma.mentorships.findUnique({
      where: { mentorship_id: id },
    });

    if (!mentorship) {
      logger.warn('Mentorship not found', { mentorshipId: id });
      throw new NotFoundError('Mentorship', id);
    }

    logger.info('Successfully retrieved mentorship', { mentorshipId: id });

    return mentorship;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch mentorship by ID', {
      mentorshipId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve mentorship');
  }
}

export async function createMentorship(data: CreateMentorshipInput) {
  try {
    logger.info('Creating new mentorship', { mentorshipData: data });

    const mentorship = await prisma.mentorships.create({ data });

    logger.info('Successfully created mentorship', {
      mentorshipId: mentorship.mentorship_id,
    });

    return mentorship;
  } catch (error) {
    logger.error('Failed to create mentorship', {
      mentorshipData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create mentorship');
  }
}

export async function updateMentorship(
  id: string,
  data: UpdateMentorshipInput
) {
  try {
    logger.info('Updating mentorship', { mentorshipId: id, updateData: data });

    const mentorship = await prisma.mentorships.update({
      where: { mentorship_id: id },
      data,
    });

    logger.info('Successfully updated mentorship', { mentorshipId: id });

    return mentorship;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Mentorship', id);
    }

    logger.error('Failed to update mentorship', {
      mentorshipId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update mentorship');
  }
}

export async function deleteMentorship(id: string) {
  try {
    logger.info('Deleting mentorship', { mentorshipId: id });

    const mentorship = await prisma.mentorships.delete({
      where: { mentorship_id: id },
    });

    logger.info('Successfully deleted mentorship', { mentorshipId: id });

    return mentorship;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Mentorship', id);
    }

    logger.error('Failed to delete mentorship', {
      mentorshipId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete mentorship');
  }
}
