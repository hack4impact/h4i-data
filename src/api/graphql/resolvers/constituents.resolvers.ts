import {
  createConstituent,
  createConstituentSchema,
  deleteConstituent,
  getAllConstituents,
  getConstituentById,
  updateConstituent,
  updateConstituentSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

type CreateConstituentInput = z.infer<typeof createConstituentSchema>;
type UpdateConstituentInput = z.infer<typeof updateConstituentSchema>;

export const constituentResolvers = {
  Query: {
    constituents: () => getAllConstituents(),
    constituent: async (_parent: unknown, { id }: { id: string }) => {
      const constituent = await getConstituentById(id);
      if (!constituent) {
        throw new GraphQLError(
          'Constituent not found',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { code: 'NOT_FOUND' }
        );
      }
      return constituent;
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
