import { prisma } from '../../config/database';
import { createLocationSchema, updateLocationSchema } from '../validators';
import { z } from 'zod';

type CreateLocationInput = z.infer<typeof createLocationSchema>;
type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export const getAllLocations = async () => {
  try {
    return await prisma.locations.findMany();
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch locations');
  }
};

export const getLocationById = async (id: string) => {
  try {
    return await prisma.locations.findUnique({
      where: { location_id: id },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch location');
  }
};

export const createLocation = async (data: CreateLocationInput) => {
  try {
    return await prisma.locations.create({ data });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to create location');
  }
};

export const updateLocation = async (id: string, data: UpdateLocationInput) => {
  try {
    return await prisma.locations.update({
      where: { location_id: id },
      data,
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to update location');
  }
};

export const deleteLocation = async (id: string) => {
  try {
    return await prisma.locations.delete({
      where: { location_id: id },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to delete location');
  }
};
