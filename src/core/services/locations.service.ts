import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createLocationSchema, updateLocationSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateLocationInput = z.infer<typeof createLocationSchema>;
type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export async function getAllLocations() {
  try {
    logger.info('Fetching all locations');
    const locations = await prisma.locations.findMany();
    logger.info('Successfully retrieved locations', {
      count: locations.length,
    });
    return locations;
  } catch (error) {
    logger.error('Failed to fetch locations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to fetch locations');
  }
}

export async function getLocationById(id: string) {
  try {
    logger.info('Fetching location by ID', { locationId: id });
    const location = await prisma.locations.findUnique({
      where: { location_id: id },
    });

    if (!location) {
      logger.warn('Location not found', { locationId: id });
      throw new NotFoundError('Location', id);
    }

    logger.info('Successfully retrieved location', { locationId: id });
    return location;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to fetch location', {
      locationId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to fetch location');
  }
}

export async function createLocation(data: CreateLocationInput) {
  try {
    logger.info('Creating new location');
    const location = await prisma.locations.create({ data });
    logger.info('Successfully created location', {
      locationId: location.location_id,
    });
    return location;
  } catch (error) {
    logger.error('Failed to create location', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create location');
  }
}

export async function updateLocation(id: string, data: UpdateLocationInput) {
  try {
    logger.info('Updating location', { locationId: id, updateData: data });
    const location = await prisma.locations.update({
      where: { location_id: id },
      data,
    });
    logger.info('Successfully updated location', { locationId: id });
    return location;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Location', id);
    }
    logger.error('Failed to update location', {
      locationId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update location');
  }
}

export async function deleteLocation(id: string) {
  try {
    logger.info('Deleting location', { locationId: id });
    const location = await prisma.locations.delete({
      where: { location_id: id },
    });
    logger.info('Successfully deleted location', { locationId: id });
    return location;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Location', id);
    }
    logger.error('Failed to delete location', {
      locationId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete location');
  }
}
