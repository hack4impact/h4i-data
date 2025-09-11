import { prisma } from '../../config/database';
import { createVolunteerSchema, updateVolunteerSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export async function getAllVolunteers() {
  try {
    logger.info('Fetching all volunteers');
    const volunteers = await prisma.volunteers.findMany({
      orderBy: { created_at: 'desc' },
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
    });

    if (!volunteer) {
      logger.warn('Volunteer not found', { volunteerId: id });
      throw new NotFoundError('Volunteer', id);
    }

    logger.info('Successfully retrieved volunteer', {
      volunteerId: id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
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
    logger.info('Creating new volunteer', {
      volunteerName: data.first_name + ' ' + data.last_name,
      volunteerData: data,
    });

    const volunteer = await prisma.volunteers.create({ data });

    logger.info('Successfully created volunteer', {
      volunteerId: volunteer.volunteer_id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
    });

    return volunteer;
  } catch (error) {
    logger.error('Failed to create volunteer', {
      volunteerData: data,
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
    });

    logger.info('Successfully updated volunteer', {
      volunteerId: id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
    });

    return volunteer;
  } catch (error) {
    logger.error('Failed to update volunteer', {
      volunteerId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if volunteer doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Volunteer', id);
    }

    throw new DatabaseError('Failed to update volunteer');
  }
}

export async function deleteVolunteer(id: string) {
  try {
    logger.info('Deleting volunteer', { volunteerId: id });

    const volunteer = await prisma.volunteers.delete({
      where: { volunteer_id: id },
    });

    logger.info('Successfully deleted volunteer', {
      volunteerId: id,
      volunteerName: volunteer.first_name + ' ' + volunteer.last_name,
    });

    return volunteer;
  } catch (error) {
    logger.error('Failed to delete volunteer', {
      volunteerId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if volunteer doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Volunteer', id);
    }

    throw new DatabaseError('Failed to delete volunteer');
  }
}
