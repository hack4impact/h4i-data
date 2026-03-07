import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createVolunteerSchema, updateVolunteerSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export async function getAllVolunteers() {
  try {
    logger.info('Fetching all volunteers');
    const volunteers = await prisma.volunteers.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully retrieved volunteers', {
      count: volunteers.length,
    });

    return volunteers;
  } catch (error) {
    logger.error('Failed to fetch volunteers', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve volunteers');
  }
}

export async function getVolunteerById(id: string) {
  try {
    logger.info('Fetching volunteer by ID', { volunteerId: id });

    const volunteer = await prisma.volunteers.findUnique({
      where: { volunteer_id: id },
      include: {
        constituents: true,
      },
    });

    if (!volunteer) {
      logger.warn('Volunteer not found', { volunteerId: id });
      throw new NotFoundError('Volunteer', id);
    }

    logger.info('Successfully retrieved volunteer', {
      volunteerId: id,
    });

    return volunteer;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch volunteer by ID', {
      volunteerId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve volunteer');
  }
}

export async function createVolunteer(data: CreateVolunteerInput) {
  try {
    logger.info('Creating new volunteer');

    // The volunteer_id must reference an existing constituent
    const constituent = await prisma.constituents.findUnique({
      where: { constituent_id: data.volunteer_id },
    });

    if (!constituent) {
      throw new NotFoundError('Constituent', data.volunteer_id);
    }

    const volunteer = await prisma.volunteers.create({
      data,
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully created volunteer', {
      volunteerId: volunteer.volunteer_id,
    });

    return volunteer;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to create volunteer', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create volunteer');
  }
}

export async function updateVolunteer(id: string, data: UpdateVolunteerInput) {
  try {
    logger.info('Updating volunteer', {
      volunteerId: id,
      updateData: data,
    });

    const volunteer = await prisma.volunteers.update({
      where: { volunteer_id: id },
      data,
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully updated volunteer', {
      volunteerId: id,
    });

    return volunteer;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Volunteer', id);
    }

    logger.error('Failed to update volunteer', {
      volunteerId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update volunteer');
  }
}

export async function deleteVolunteer(id: string) {
  try {
    logger.info('Deleting volunteer', { volunteerId: id });

    const volunteer = await prisma.volunteers.delete({
      where: { volunteer_id: id },
      include: {
        constituents: true,
      },
    });

    logger.info('Successfully deleted volunteer', {
      volunteerId: id,
    });

    return volunteer;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Volunteer', id);
    }

    logger.error('Failed to delete volunteer', {
      volunteerId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete volunteer');
  }
}
