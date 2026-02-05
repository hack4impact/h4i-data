// src/core/services/sponsor.service.ts
import { prisma } from '../../config/database';
import { createSponsorSchema, updateSponsorSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateSponsorInput = z.infer<typeof createSponsorSchema>;
type UpdateSponsorInput = z.infer<typeof updateSponsorSchema>;

export async function getAllSponsors() {
  try {
    logger.info('Fetching all sponsors');
    const sponsors = await prisma.sponsors.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved sponsors', {
      count: sponsors.length,
    });

    return sponsors;
  } catch (error) {
    logger.error('Failed to fetch sponsors', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve sponsors');
  }
}

export async function getSponsorById(id: string) {
  try {
    logger.info('Fetching sponsor by ID', { sponsorId: id });

    const sponsor = await prisma.sponsors.findUnique({
      where: { sponsor_id: id },
    });

    if (!sponsor) {
      logger.warn('Sponsor not found', { sponsorId: id });
      throw new NotFoundError('Sponsor', id);
    }

    logger.info('Successfully retrieved sponsor', {
      sponsorId: id,
      sponsorName: sponsor.name,
    });

    return sponsor;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch sponsor by ID', {
      sponsorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve sponsor');
  }
}

export async function createSponsor(data: CreateSponsorInput) {
  try {
    logger.info('Creating new sponsor', {
      sponsorName: data.name,
      sponsorData: data,
    });

    const sponsor = await prisma.sponsors.create({ data });

    logger.info('Successfully created sponsor', {
      sponsorId: sponsor.sponsor_id,
      sponsorName: sponsor.name,
    });

    return sponsor;
  } catch (error) {
    logger.error('Failed to create sponsor', {
      sponsorData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create sponsor');
  }
}

export async function updateSponsor(id: string, data: UpdateSponsorInput) {
  try {
    logger.info('Updating sponsor', {
      sponsorId: id,
      updateData: data,
    });

    const sponsor = await prisma.sponsors.update({
      where: { sponsor_id: id },
      data,
    });

    logger.info('Successfully updated sponsor', {
      sponsorId: id,
      sponsorName: sponsor.name,
    });

    return sponsor;
  } catch (error) {
    logger.error('Failed to update sponsor', {
      sponsorId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if sponsor doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Sponsor', id);
    }

    throw new DatabaseError('Failed to update sponsor');
  }
}

export async function deleteSponsor(id: string) {
  try {
    logger.info('Deleting sponsor', { sponsorId: id });

    const sponsor = await prisma.sponsors.delete({
      where: { sponsor_id: id },
    });

    logger.info('Successfully deleted sponsor', {
      sponsorId: id,
      sponsorName: sponsor.name,
    });

    return sponsor;
  } catch (error) {
    logger.error('Failed to delete sponsor', {
      sponsorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if sponsor doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Sponsor', id);
    }

    throw new DatabaseError('Failed to delete sponsor');
  }
}
