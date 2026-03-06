import {
  createLocation,
  createLocationSchema,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  updateLocationSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateLocationInput = z.infer<typeof createLocationSchema>;
type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export const locationResolvers = {
  Query: {
    locations: () => getAllLocations(),
    location: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getLocationById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createLocation: (
      _parent: unknown,
      { input }: { input: CreateLocationInput }
    ) => {
      const validatedInput = createLocationSchema.parse(input);
      return createLocation(validatedInput);
    },
    updateLocation: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateLocationInput }
    ) => {
      const validatedInput = updateLocationSchema.parse(input);
      return updateLocation(id, validatedInput);
    },
    deleteLocation: (_parent: unknown, { id }: { id: string }) => {
      return deleteLocation(id);
    },
  },
};
