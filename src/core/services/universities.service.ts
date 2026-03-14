import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createUniversitySchema, updateUniversitySchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;

export async function getAllUniversities() {
  try {
    logger.info('Fetching all universities');
    const universities = await prisma.universities.findMany({
      orderBy: { name: 'asc' },
    });

    logger.info('Successfully retrieved universities', {
      count: universities.length,
    });

    return universities;
  } catch (error) {
    logger.error('Failed to fetch universities', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve universities');
  }
}

export async function getUniversityById(id: string) {
  try {
    logger.info('Fetching university by ID', { universityId: id });

    const university = await prisma.universities.findUnique({
      where: { university_id: id },
    });

    if (!university) {
      logger.warn('University not found', { universityId: id });
      throw new NotFoundError('University', id);
    }

    logger.info('Successfully retrieved university', {
      universityId: id,
    });

    return university;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch university by ID', {
      universityId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve university');
  }
}

export async function createUniversity(data: CreateUniversityInput) {
  try {
    logger.info('Creating new university');

    const university = await prisma.universities.create({ data });

    logger.info('Successfully created university', {
      universityId: university.university_id,
    });

    return university;
  } catch (error) {
    logger.error('Failed to create university', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create university');
  }
}

export async function updateUniversity(
  id: string,
  data: UpdateUniversityInput
) {
  try {
    logger.info('Updating university', { universityId: id, updateData: data });

    const university = await prisma.universities.update({
      where: { university_id: id },
      data,
    });

    logger.info('Successfully updated university', { universityId: id });

    return university;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('University', id);
    }

    logger.error('Failed to update university', {
      universityId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update university');
  }
}

export async function deleteUniversity(id: string) {
  try {
    logger.info('Deleting university', { universityId: id });

    const university = await prisma.universities.delete({
      where: { university_id: id },
    });

    logger.info('Successfully deleted university', { universityId: id });

    return university;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('University', id);
    }

    logger.error('Failed to delete university', {
      universityId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete university');
  }
}
