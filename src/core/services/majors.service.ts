import { prisma } from '../../config/database';
import { createMajorSchema, updateMajorSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateMajorInput = z.infer<typeof createMajorSchema>;
type UpdateMajorInput = z.infer<typeof updateMajorSchema>;

export async function getAllMajors() {
  try {
    logger.info('Fetching all majors');
    const majors = await prisma.majors.findMany({
      orderBy: { name: 'asc' },
    });

    logger.info('Successfully retrieved majors', {
      count: majors.length,
    });

    return majors;
  } catch (error) {
    logger.error('Failed to fetch majors', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve majors');
  }
}

export async function getMajorById(id: string) {
  try {
    logger.info('Fetching major by ID', { majorId: id });

    const major = await prisma.majors.findUnique({
      where: { major_id: id },
    });

    if (!major) {
      logger.warn('Major not found', { majorId: id });
      throw new NotFoundError('Major', id);
    }

    logger.info('Successfully retrieved major', { majorId: id });

    return major;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch major by ID', {
      majorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve major');
  }
}

export async function createMajor(data: CreateMajorInput) {
  try {
    logger.info('Creating new major', { majorData: data });

    const major = await prisma.majors.create({ data });

    logger.info('Successfully created major', {
      majorId: major.major_id,
    });

    return major;
  } catch (error) {
    logger.error('Failed to create major', {
      majorData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create major');
  }
}

export async function updateMajor(id: string, data: UpdateMajorInput) {
  try {
    logger.info('Updating major', { majorId: id, updateData: data });

    const major = await prisma.majors.update({
      where: { major_id: id },
      data,
    });

    logger.info('Successfully updated major', { majorId: id });

    return major;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Major', id);
    }

    logger.error('Failed to update major', {
      majorId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update major');
  }
}

export async function deleteMajor(id: string) {
  try {
    logger.info('Deleting major', { majorId: id });

    const major = await prisma.majors.delete({
      where: { major_id: id },
    });

    logger.info('Successfully deleted major', { majorId: id });

    return major;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Major', id);
    }

    logger.error('Failed to delete major', {
      majorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete major');
  }
}
