import {
  createLocation,
  createLocationSchema,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  updateLocationSchema,
} from '../../../core';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateLocationInput = z.infer<typeof createLocationSchema>;
type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export const locationResolvers = {
  Query: {
    locations: () => getAllLocations(),
    location: (_parent: unknown, { id }: { id: string }) => {
      return getLocationById(id);
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
