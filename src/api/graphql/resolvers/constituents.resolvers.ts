import {
  createConstituent,
  createConstituentSchema,
  deleteConstituent,
  getAllConstituents,
  getConstituentById,
  updateConstituent,
  updateConstituentSchema,
} from '../../../core';
import { z } from 'zod';

type CreateConstituentInput = z.infer<typeof createConstituentSchema>;
type UpdateConstituentInput = z.infer<typeof updateConstituentSchema>;

export const constituentResolvers = {
  Query: {
    constituents: () => getAllConstituents(),
    constituent: (_parent: unknown, { id }: { id: string }) => {
      return getConstituentById(id);
    },
  },
  Mutation: {
    createConstituent: (
      _parent: unknown,
      { input }: { input: CreateConstituentInput }
    ) => {
      const validatedInput = createConstituentSchema.parse(input);
      return createConstituent(validatedInput);
    },
    updateConstituent: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateConstituentInput }
    ) => {
      const validatedInput = updateConstituentSchema.parse(input);
      return updateConstituent(id, validatedInput);
    },
    deleteConstituent: (_parent: unknown, { id }: { id: string }) => {
      return deleteConstituent(id);
    },
  },
};
