import {
    createNonprofit,
    createNonprofitSchema,
    deleteNonprofit,
    getAllNonprofits,
    getNonprofitById,
    updateNonprofit,
    updateNonprofitSchema,
  } from '../../../core';
  import { GraphQLError } from 'graphql';
  import { z } from 'zod';
  
  // Infer TypeScript types directly from your Zod schemas
  type CreateNonprofitInput = z.infer<typeof createNonprofitSchema>;
  type UpdateNonprofitInput = z.infer<typeof updateNonprofitSchema>;
  
  export const nonprofitResolvers = {
    Query: {
      nonprofits: () => getAllNonprofits(),
      nonprofit: async (_parent: unknown, { id }: { id: string }) => {
        const nonprofit = await getNonprofitById(id);
        if (!nonprofit) {
          throw new GraphQLError(
            'Nonprofit not found',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            { code: 'NOT_FOUND' }
          );
        }
        return nonprofit;
      },
    },
    Mutation: {
      createNonprofit: (
        _parent: unknown,
        { input }: { input: CreateNonprofitInput }
      ) => {
        const validatedInput = createNonprofitSchema.parse(input);
        return createNonprofit(validatedInput);
      },
      updateNonprofit: (
        _parent: unknown,
        { id, input }: { id: string; input: UpdateNonprofitInput }
      ) => {
        const validatedInput = updateNonprofitSchema.parse(input);
        return updateNonprofit(id, validatedInput);
      },
      deleteNonprofit: (_parent: unknown, { id }: { id: string }) => {
        return deleteNonprofit(id);
      },
    },
  };
  