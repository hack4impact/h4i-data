// src/services/volunteerService.ts
import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { volunteerSchema, VolunteerInput } from '../types';
import { ZodError } from 'zod';
import { ApiError } from '../../utils';

export class VolunteerService {
  getAllVolunteers = async () => {
    try {
      return await prisma.volunteers.findMany({
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch volunteers from the database');
    }
  };

  createVolunteer = async (data: unknown) => {
    try {
      const validatedData = volunteerSchema.parse(data);

      return await prisma.volunteers.create({
        data: validatedData,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ApiError(400, error.errors.map((e) => e.message).join(', '));
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ApiError(409, 'A volunteer with this email already exists');
        }
      }
      throw new ApiError(
        500,
        'An unexpected error occurred while creating the volunteer'
      );
    }
  };

  getVolunteerById = async (id: string) => {
    try {
      const volunteer = await prisma.volunteers.findUnique({
        where: { volunteer_id: id },
      });

      if (!volunteer) {
        throw new ApiError(404, 'Volunteer not found');
      }

      return volunteer;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        'An unexpected error occurred while fetching the volunteer'
      );
    }
  };
}

export const volunteerService = new VolunteerService();
