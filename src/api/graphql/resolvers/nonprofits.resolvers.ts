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
import { Prisma, status_type } from '@prisma/client';

type CreateNonprofitInput = z.infer<typeof createNonprofitSchema>;
type UpdateNonprofitInput = z.infer<typeof updateNonprofitSchema>;

interface NonprofitsQueryArgs {
  chapterIds?: string[];
  chapterNames?: string[];
  statuses?: StatusType[];
  sort?: NonprofitSortOption[];
}

interface NonprofitChapterProjectsArgs {
  nonprofitIds?: string[];
  chapterIds?: string[];
  projectStatuses?: StatusType[];
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

    nonprofitChapterProjects: async (
      _parent: unknown,
      {
        nonprofitIds,
        chapterIds,
        projectStatuses,
      }: NonprofitChapterProjectsArgs
    ) => {
      const where: Prisma.nonprofit_chapter_projectWhereInput = {};

      if (nonprofitIds?.length) where.nonprofit_id = { in: nonprofitIds };
      if (chapterIds?.length) where.chapter_id = { in: chapterIds };

      if (projectStatuses?.length) {
        where.project_status = {
          in: projectStatuses.map((s) =>
            s === 'ACTIVE' ? status_type.ACTIVE : status_type.INACTIVE
          ),
        };
      }

      const rows = await prisma.nonprofit_chapter_project.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });

      return rows ?? [];
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
