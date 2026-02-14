import {
  createMajor,
  createMajorSchema,
  deleteMajor,
  getAllMajors,
  getMajorById,
  updateMajor,
  updateMajorSchema,
} from '../../../core';
import { z } from 'zod';

type CreateMajorInput = z.infer<typeof createMajorSchema>;
type UpdateMajorInput = z.infer<typeof updateMajorSchema>;

export const majorResolvers = {
  Query: {
    majors: () => getAllMajors(),
    major: async (_parent: unknown, { id }: { id: string }) => {
      return getMajorById(id);
    },
  },
  Mutation: {
    createMajor: (_parent: unknown, { input }: { input: CreateMajorInput }) => {
      const validatedInput = createMajorSchema.parse(input);
      return createMajor(validatedInput);
    },
    updateMajor: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateMajorInput }
    ) => {
      const validatedInput = updateMajorSchema.parse(input);
      return updateMajor(id, validatedInput);
    },
    deleteMajor: (_parent: unknown, { id }: { id: string }) => {
      return deleteMajor(id);
    },
  },
};
