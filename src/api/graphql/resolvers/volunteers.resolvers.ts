import {
  createVolunteer,
  createVolunteerSchema,
  deleteVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  updateVolunteerSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export const volunteerResolvers = {
  Query: {
    volunteers: () => getAllVolunteers(),
    volunteer: async (_parent: unknown, { id }: { id: string }) => {
      const volunteer = await getVolunteerById(id);
      if (!volunteer) {
        throw new GraphQLError(
          'Volunteer not found',
          undefined, // nodes
          undefined, // source
          undefined, // positions
          undefined, // path
          undefined, // originalError
          { code: 'NOT_FOUND' } // extensions
        );
      }
      return volunteer;
    },
  },
  Mutation: {
    createVolunteer: (
      _parent: unknown,
      { input }: { input: CreateVolunteerInput }
    ) => {
      const validatedInput = createVolunteerSchema.parse(input);
      return createVolunteer(validatedInput);
    },
    updateVolunteer: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateVolunteerInput }
    ) => {
      const validatedInput = updateVolunteerSchema.parse(input);
      return updateVolunteer(id, validatedInput);
    },
    deleteVolunteer: (_parent: unknown, { id }: { id: string }) => {
      return deleteVolunteer(id);
    },
  },
};
