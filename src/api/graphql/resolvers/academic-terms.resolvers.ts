import {
  createAcademicTerm,
  createAcademicTermSchema,
  deleteAcademicTerm,
  getAllAcademicTerms,
  getAcademicTermById,
  updateAcademicTerm,
  updateAcademicTermSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateAcademicTermInput = z.infer<typeof createAcademicTermSchema>;
type UpdateAcademicTermInput = z.infer<typeof updateAcademicTermSchema>;

export const academicTermResolvers = {
  Query: {
    academicTerms: () => getAllAcademicTerms(),
    academicTerm: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getAcademicTermById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createAcademicTerm: (
      _parent: unknown,
      { input }: { input: CreateAcademicTermInput }
    ) => {
      const validatedInput = createAcademicTermSchema.parse(input);
      return createAcademicTerm(validatedInput);
    },
    updateAcademicTerm: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateAcademicTermInput }
    ) => {
      const validatedInput = updateAcademicTermSchema.parse(input);
      return updateAcademicTerm(id, validatedInput);
    },
    deleteAcademicTerm: (_parent: unknown, { id }: { id: string }) => {
      return deleteAcademicTerm(id);
    },
  },
};
