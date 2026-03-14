import {
  createVolunteerHistory,
  createVolunteerHistorySchema,
  deleteVolunteerHistory,
  getAllVolunteerHistory,
  getVolunteerHistoryById,
  updateVolunteerHistory,
  updateVolunteerHistorySchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateVolunteerHistoryInput = z.infer<typeof createVolunteerHistorySchema>;
type UpdateVolunteerHistoryInput = z.infer<typeof updateVolunteerHistorySchema>;

export const volunteerHistoryResolvers = {
  Query: {
    volunteerHistories: () => getAllVolunteerHistory(),
    volunteerHistory: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getVolunteerHistoryById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
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
