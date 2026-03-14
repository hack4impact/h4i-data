import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createConstituentSchema,
  updateConstituentSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateConstituentInput = z.infer<typeof createConstituentSchema>;
type UpdateConstituentInput = z.infer<typeof updateConstituentSchema>;

export async function getAllConstituents() {
  try {
    logger.info('Fetching all constituents');
    const constituents = await prisma.constituents.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved constituents', {
      count: constituents.length,
    });

    return constituents;
  } catch (error) {
    logger.error('Failed to fetch constituents', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve constituents');
  }
}

export async function getConstituentById(id: string) {
  try {
    logger.info('Fetching constituent by ID', { constituentId: id });

    const constituent = await prisma.constituents.findUnique({
      where: { constituent_id: id },
    });

    if (!constituent) {
      logger.warn('Constituent not found', { constituentId: id });
      throw new NotFoundError('Constituent', id);
    }

    logger.info('Successfully retrieved constituent', {
      constituentId: id,
    });

    return constituent;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch constituent by ID', {
      constituentId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve constituent');
  }
}

export async function createConstituent(data: CreateConstituentInput) {
  try {
    logger.info('Creating new constituent');

    const constituent = await prisma.constituents.create({ data });

    logger.info('Successfully created constituent', {
      constituentId: constituent.constituent_id,
    });

    return constituent;
  } catch (error) {
    logger.error('Failed to create constituent', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create constituent');
  }
}

export async function updateConstituent(
  id: string,
  data: UpdateConstituentInput
) {
  try {
    logger.info('Updating constituent', {
      constituentId: id,
      updateData: data,
    });

    const constituent = await prisma.constituents.update({
      where: { constituent_id: id },
      data,
    });

    logger.info('Successfully updated constituent', {
      constituentId: id,
    });

    return constituent;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Constituent', id);
    }

    logger.error('Failed to update constituent', {
      constituentId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update constituent');
  }
}

export async function deleteConstituent(id: string) {
  try {
    logger.info('Deleting constituent', { constituentId: id });

    const constituent = await prisma.constituents.delete({
      where: { constituent_id: id },
    });

    logger.info('Successfully deleted constituent', {
      constituentId: id,
    });

    return constituent;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Constituent', id);
    }

    logger.error('Failed to delete constituent', {
      constituentId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete constituent');
  }
}
