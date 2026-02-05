import {
  createVolunteerHistory,
  createVolunteerHistorySchema,
  deleteVolunteerHistory,
  getAllVolunteerHistory,
  getVolunteerHistoryById,
  updateVolunteerHistory,
  updateVolunteerHistorySchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

type CreateVolunteerHistoryInput = z.infer<typeof createVolunteerHistorySchema>;
type UpdateVolunteerHistoryInput = z.infer<typeof updateVolunteerHistorySchema>;

export const volunteerHistoryResolvers = {
  Query: {
    volunteerHistories: () => getAllVolunteerHistory(),
    volunteerHistory: async (_parent: unknown, { id }: { id: string }) => {
      const history = await getVolunteerHistoryById(id);
      if (!history) {
        throw new GraphQLError(
          'Volunteer history not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return history;
    },
  },
  Mutation: {
    createVolunteerHistory: (
      _parent: unknown,
      { input }: { input: CreateVolunteerHistoryInput }
    ) => {
      const validatedInput = createVolunteerHistorySchema.parse(input);
      return createVolunteerHistory(validatedInput);
    },
    updateVolunteerHistory: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateVolunteerHistoryInput }
    ) => {
      const validatedInput = updateVolunteerHistorySchema.parse(input);
      return updateVolunteerHistory(id, validatedInput);
    },
    deleteVolunteerHistory: (_parent: unknown, { id }: { id: string }) => {
      return deleteVolunteerHistory(id);
    },
  },
};
