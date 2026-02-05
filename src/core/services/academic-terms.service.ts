import { prisma } from '../../config/database';
import {
  createAcademicTermSchema,
  updateAcademicTermSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateAcademicTermInput = z.infer<typeof createAcademicTermSchema>;
type UpdateAcademicTermInput = z.infer<typeof updateAcademicTermSchema>;

export async function getAllAcademicTerms() {
  try {
    logger.info('Fetching all academic terms');
    const terms = await prisma.academic_terms.findMany({
      orderBy: { start_date: 'desc' },
    });

    logger.info('Successfully retrieved academic terms', {
      count: terms.length,
    });

    return terms;
  } catch (error) {
    logger.error('Failed to fetch academic terms', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve academic terms');
  }
}

export async function getAcademicTermById(id: string) {
  try {
    logger.info('Fetching academic term by ID', { termId: id });

    const term = await prisma.academic_terms.findUnique({
      where: { term_id: id },
    });

    if (!term) {
      logger.warn('Academic term not found', { termId: id });
      throw new NotFoundError('AcademicTerm', id);
    }

    logger.info('Successfully retrieved academic term', { termId: id });

    return term;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch academic term by ID', {
      termId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve academic term');
  }
}

export async function createAcademicTerm(data: CreateAcademicTermInput) {
  try {
    logger.info('Creating new academic term', { termData: data });

    const term = await prisma.academic_terms.create({ data });

    logger.info('Successfully created academic term', {
      termId: term.term_id,
    });

    return term;
  } catch (error) {
    logger.error('Failed to create academic term', {
      termData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create academic term');
  }
}

export async function updateAcademicTerm(
  id: string,
  data: UpdateAcademicTermInput
) {
  try {
    logger.info('Updating academic term', { termId: id, updateData: data });

    const term = await prisma.academic_terms.update({
      where: { term_id: id },
      data,
    });

    logger.info('Successfully updated academic term', { termId: id });

    return term;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('AcademicTerm', id);
    }

    logger.error('Failed to update academic term', {
      termId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update academic term');
  }
}

export async function deleteAcademicTerm(id: string) {
  try {
    logger.info('Deleting academic term', { termId: id });

    const term = await prisma.academic_terms.delete({
      where: { term_id: id },
    });

    logger.info('Successfully deleted academic term', { termId: id });

    return term;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('AcademicTerm', id);
    }

    logger.error('Failed to delete academic term', {
      termId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete academic term');
  }
}
