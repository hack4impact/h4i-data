import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createMentorSchema, updateMentorSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateMentorInput = z.infer<typeof createMentorSchema>;
type UpdateMentorInput = z.infer<typeof updateMentorSchema>;

export async function getAllMentors() {
  try {
    logger.info('Fetching all mentors');
    const mentors = await prisma.mentors.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully retrieved mentors', {
      count: mentors.length,
    });

    return mentors;
  } catch (error) {
    logger.error('Failed to fetch mentors', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve mentors');
  }
}

export async function getMentorById(id: string) {
  try {
    logger.info('Fetching mentor by ID', { mentorId: id });

    const mentor = await prisma.mentors.findUnique({
      where: { mentor_id: id },
      include: {
        constituents: true,
      },
    });

    if (!mentor) {
      logger.warn('Mentor not found', { mentorId: id });
      throw new NotFoundError('Mentor', id);
    }

    logger.info('Successfully retrieved mentor', {
      mentorId: id,
    });

    return mentor;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch mentor by ID', {
      mentorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve mentor');
  }
}

export async function createMentor(data: CreateMentorInput) {
  try {
    logger.info('Creating new mentor');

    // The mentor_id must reference an existing constituent
    const constituent = await prisma.constituents.findUnique({
      where: { constituent_id: data.mentor_id },
    });

    if (!constituent) {
      throw new NotFoundError('Constituent', data.mentor_id);
    }

    const mentor = await prisma.mentors.create({
      data,
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully created mentor', {
      mentorId: mentor.mentor_id,
    });

    return mentor;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to create mentor', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create mentor');
  }
}

export async function updateMentor(id: string, data: UpdateMentorInput) {
  try {
    logger.info('Updating mentor', {
      mentorId: id,
      updateData: data,
    });

    const mentor = await prisma.mentors.update({
      where: { mentor_id: id },
      data,
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully updated mentor', {
      mentorId: id,
    });

    return mentor;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Mentor', id);
    }

    logger.error('Failed to update mentor', {
      mentorId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update mentor');
  }
}

export async function deleteMentor(id: string) {
  try {
    logger.info('Deleting mentor', { mentorId: id });

    const mentor = await prisma.mentors.delete({
      where: { mentor_id: id },
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully deleted mentor', {
      mentorId: id,
    });

    return mentor;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Mentor', id);
    }

    logger.error('Failed to delete mentor', {
      mentorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete mentor');
  }
}
