// src/core/services/nonprofits.service.ts
import { prisma } from '../../config/database';
import { createNonprofitSchema, updateNonprofitSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

type CreateNonprofitInput = z.infer<typeof createNonprofitSchema>;
type UpdateNonprofitInput = z.infer<typeof updateNonprofitSchema>;

export async function getAllNonprofits() {
  try {
    logger.info('Fetching all nonprofits');
    const nonprofits = await prisma.nonprofits.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved nonprofits', {
      count: nonprofits.length,
    });

    return nonprofits;
  } catch (error) {
    logger.error('Failed to fetch nonprofits', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve nonprofits');
  }
}

export async function getNonprofitById(id: string) {
  try {
    logger.info('Fetching nonprofit by ID', { nonprofitId: id });

    const nonprofit = await prisma.nonprofits.findUnique({
      where: { nonprofit_id: id },
    });

    if (!nonprofit) {
      logger.warn('Nonprofit not found', { nonprofitId: id });
      throw new NotFoundError('Nonprofit', id);
    }

    logger.info('Successfully retrieved nonprofit', {
      nonprofitId: id,
      nonprofitName: nonprofit.name,
    });

    return nonprofit;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch nonprofit by ID', {
      nonprofittId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve nonprofit');
  }
}

export async function createNonprofit(input: CreateNonprofitInput) {
  try {
    logger.info('Creating new nonprofit', {
      nonprofitName: input.name,
      nonprofitData: input,
    });

    // Destructure and include only defined optionals
    const { name, mission, contact_id, website, location_id } = input;

    const data: Prisma.nonprofitsUncheckedCreateInput = {
      name,
      mission, // required string
      contact_id, // required string
      ...(website === undefined ? {} : { website }), // include if not undefined (can be null)
      ...(location_id === undefined ? {} : { location_id }), // include if not undefined (can be null)
    };

    const nonprofit = await prisma.nonprofits.create({ data });

    logger.info('Successfully created nonprofit', {
      nonprofitId: nonprofit.nonprofit_id,
      nonprofitName: nonprofit.name,
    });

    return nonprofit;
  } catch (error) {
    logger.error('Failed to create nonprofit', {
      nonprofitData: input,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create nonprofit');
  }
}

export async function updateNonprofit(id: string, input: UpdateNonprofitInput) {
  try {
    logger.info('Updating nonprofit', {
      nonprofitId: id,
      updateData: input,
    });

    const { name, mission, contact_id, website, location_id } = input;

    const data: Prisma.nonprofitsUncheckedUpdateInput = {
      ...(name === undefined ? {} : { name }),
      ...(mission === undefined ? {} : { mission }),
      ...(contact_id === undefined ? {} : { contact_id }),
      ...(website === undefined ? {} : { website }), // null clears it
      ...(location_id === undefined ? {} : { location_id }), // null clears it
    };

    const nonprofit = await prisma.nonprofits.update({
      where: { nonprofit_id: id },
      data,
    });

    logger.info('Successfully updated nonprofit', {
      nonprofitId: id,
      nonprofitName: nonprofit.name,
    });

    return nonprofit;
  } catch (error) {
    logger.error('Failed to update nonprofit', {
      nonprofitId: id,
      updateData: input,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Nonprofit', id);
    }

    throw new DatabaseError('Failed to update nonprofit');
  }
}

export async function deleteNonprofit(id: string) {
  try {
    logger.info('Deleting nonprofit', { nonprofitId: id });

    const nonprofit = await prisma.nonprofits.delete({
      where: { nonprofit_id: id },
    });

    logger.info('Successfully deleted nonprofit', {
      nonprofitId: id,
      nonprofitName: nonprofit.name,
    });

    return nonprofit;
  } catch (error) {
    logger.error('Failed to delete nonprofit', {
      nonprofitId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if nonprofit doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Nonprofit', id);
    }

    throw new DatabaseError('Failed to delete nonprofit');
  }
}
