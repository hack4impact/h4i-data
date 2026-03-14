import {
  createUniversity,
  createUniversitySchema,
  deleteUniversity,
  getAllUniversities,
  getUniversityById,
  updateUniversity,
  updateUniversitySchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;

export const universityResolvers = {
  Query: {
    universities: () => getAllUniversities(),
    university: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getUniversityById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createUniversity: (
      _parent: unknown,
      { input }: { input: CreateUniversityInput }
    ) => {
      const validatedInput = createUniversitySchema.parse(input);
      return createUniversity(validatedInput);
    },
    updateUniversity: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateUniversityInput }
    ) => {
      const validatedInput = updateUniversitySchema.parse(input);
      return updateUniversity(id, validatedInput);
    },
    deleteUniversity: (_parent: unknown, { id }: { id: string }) => {
      return deleteUniversity(id);
    },
  },
};
