import {
  createLocation,
  createLocationSchema,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  updateLocationSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateLocationInput = z.infer<typeof createLocationSchema>;
type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export const locationResolvers = {
  Query: {
    locations: () => getAllLocations(),
    location: async (_parent: unknown, { id }: { id: string }) => {
      const location = await getLocationById(id);
      if (!location) {
        throw new GraphQLError(
          'Location not found',
          undefined, // nodes
          undefined, // source
          undefined, // positions
          undefined, // path
          undefined, // originalError
          { code: 'NOT_FOUND' } // extensions
        );
      }
      return location;
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
