import {
  createMentorship,
  createMentorshipSchema,
  deleteMentorship,
  getAllMentorships,
  getMentorshipById,
  updateMentorship,
  updateMentorshipSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateMentorshipInput = z.infer<typeof createMentorshipSchema>;
type UpdateMentorshipInput = z.infer<typeof updateMentorshipSchema>;

export const mentorshipResolvers = {
  Query: {
    mentorships: () => getAllMentorships(),
    mentorship: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getMentorshipById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createMentorship: (
      _parent: unknown,
      { input }: { input: CreateMentorshipInput }
    ) => {
      const validatedInput = createMentorshipSchema.parse(input);
      return createMentorship(validatedInput);
    },
    updateMentorship: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateMentorshipInput }
    ) => {
      const validatedInput = updateMentorshipSchema.parse(input);
      return updateMentorship(id, validatedInput);
    },
    deleteMentorship: (_parent: unknown, { id }: { id: string }) => {
      return deleteMentorship(id);
    },
  },
};
