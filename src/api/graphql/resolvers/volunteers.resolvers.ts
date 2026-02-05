import { z } from 'zod';
import {
  createVolunteer,
  createVolunteerSchema,
  deleteVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  updateVolunteerSchema,
} from '../../../core';

type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export const volunteerResolvers = {
  Query: {
    volunteers: () => getAllVolunteers(),
    volunteer: async (_parent: unknown, { id }: { id: string }) => {
      return getVolunteerById(id);
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
  Volunteer: {
    constituent: (parent: { constituents?: unknown }) => parent.constituents,
  },
};
