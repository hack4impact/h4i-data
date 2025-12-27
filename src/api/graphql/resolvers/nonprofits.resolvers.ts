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
import { prisma } from '../../../config/database';
import { status_type } from '@prisma/client';

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

      if (
        (!resolvedChapterIds || resolvedChapterIds.length === 0) &&
        chapterNames?.length
      ) {
        resolvedChapterIds = await getChapterIdsByNames(chapterNames);
        if (!resolvedChapterIds.length) return [];
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

  Nonprofit: {
    chapters: async (parent: { nonprofit_id: string }) => {
      const rows = await prisma.nonprofit_chapter_project.findMany({
        where: { nonprofit_id: parent.nonprofit_id },
        select: {
          project_status: true,
          chapters: {
            select: {
              chapter_id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return rows
        .filter(
          (
            r
          ): r is {
            project_status: status_type;
            chapters: { chapter_id: string; name: string };
          } => r.chapters !== null
        )
        .map((r) => ({
          chapter_id: r.chapters.chapter_id,
          chapter_name: r.chapters.name,
          project_status:
            r.project_status === status_type.ACTIVE ? 'ACTIVE' : 'INACTIVE',
        }));
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
