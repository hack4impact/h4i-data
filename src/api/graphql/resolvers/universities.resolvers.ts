import {
  createUniversity,
  createUniversitySchema,
  deleteUniversity,
  getAllUniversities,
  getUniversityById,
  updateUniversity,
  updateUniversitySchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;

export const universityResolvers = {
  Query: {
    universities: () => getAllUniversities(),
    university: async (_parent: unknown, { id }: { id: string }) => {
      const university = await getUniversityById(id);
      if (!university) {
        throw new GraphQLError(
          'University not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return university;
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
