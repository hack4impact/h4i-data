import { z } from 'zod';
import {
  createMentor,
  createMentorSchema,
  deleteMentor,
  getAllMentors,
  getMentorById,
  updateMentor,
  updateMentorSchema,
} from '../../../core';

type CreateMentorInput = z.infer<typeof createMentorSchema>;
type UpdateMentorInput = z.infer<typeof updateMentorSchema>;

export const mentorResolvers = {
  Query: {
    mentors: () => getAllMentors(),
    mentor: async (_parent: unknown, { id }: { id: string }) => {
      return getMentorById(id);
    },
  },
  Mutation: {
    createMentor: (
      _parent: unknown,
      { input }: { input: CreateMentorInput }
    ) => {
      const validatedInput = createMentorSchema.parse(input);
      return createMentor(validatedInput);
    },
    updateMentor: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateMentorInput }
    ) => {
      const validatedInput = updateMentorSchema.parse(input);
      return updateMentor(id, validatedInput);
    },
    deleteMentor: (_parent: unknown, { id }: { id: string }) => {
      return deleteMentor(id);
    },
  },
  Mentor: {
    constituent: (parent: { constituents?: unknown }) => parent.constituents,
  },
};
