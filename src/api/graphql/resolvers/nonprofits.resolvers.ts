import {
  createNonprofit,
  createNonprofitSchema,
  deleteNonprofit,
  getNonprofitById,
  getNonprofitsWithFilters,
  updateNonprofit,
  updateNonprofitSchema,
  getChapterIdsByNames,
} from '../../../core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';
import type {
  StatusType,
  NonprofitSortOption,
} from '../../../core/services/nonprofits.service';

type CreateNonprofitInput = z.infer<typeof createNonprofitSchema>;
type UpdateNonprofitInput = z.infer<typeof updateNonprofitSchema>;

interface NonprofitsQueryArgs {
  chapterIds?: string[];
  chapterNames?: string[];
  statuses?: StatusType[];
  sort?: NonprofitSortOption[];
}

export const nonprofitResolvers = {
  Query: {
    nonprofits: async (
      _parent: unknown,
      { chapterIds, chapterNames, statuses, sort }: NonprofitsQueryArgs
    ) => {
      let resolvedChapterIds = chapterIds;

      // If frontend passes chapterNames, convert them to ids
      if (
        (!resolvedChapterIds || resolvedChapterIds.length === 0) &&
        chapterNames?.length
      ) {
        resolvedChapterIds = await getChapterIdsByNames(chapterNames);

        // If user selected chapters but none matched, return empty list
        if (!resolvedChapterIds || resolvedChapterIds.length === 0) return [];
      }

      return getNonprofitsWithFilters({
        chapterIds: resolvedChapterIds,
        statuses,
        sort,
      });
    },

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
      {
        nonprofit_id,
        input,
      }: { nonprofit_id: string; input: UpdateNonprofitInput }
    ) => {
      const validatedInput = updateNonprofitSchema.parse(input);
      return updateNonprofit(nonprofit_id, validatedInput);
    },

    deleteNonprofit: (_parent: unknown, { id }: { id: string }) => {
      return deleteNonprofit(id);
    },
  },
};
