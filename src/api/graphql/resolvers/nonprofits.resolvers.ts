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
  chapterNames?: string[];
  statuses?: StatusType[];
  sort?: NonprofitSortOption[];
}

interface GetNonprofitsWithFiltersArgs {
  statuses?: StatusType[];
  sort?: NonprofitSortOption[];
  chapterIds?: string[];
}

interface NonprofitParent {
  nonprofit_id: string;
}

interface ChapterRow {
  project_status: status_type;
  chapter_id: string | null;
  chapters: { chapter_id: string; name: string } | null;
}

export const nonprofitResolvers = {
  Query: {
    nonprofits: async (
      _parent: unknown,
      { chapterNames, statuses, sort }: NonprofitsQueryArgs
    ) => {
      let resolvedChapterIds: string[] | undefined;

      if (chapterNames?.length) {
        resolvedChapterIds = await getChapterIdsByNames(chapterNames);
        if (!resolvedChapterIds.length) return [];
      }

      const serviceArgs: GetNonprofitsWithFiltersArgs = {
        statuses,
        sort,
        ...(resolvedChapterIds?.length
          ? { chapterIds: resolvedChapterIds }
          : {}),
      };

      const nonprofits = await getNonprofitsWithFilters(serviceArgs);

      return nonprofits.map((np) => ({
        ...np,
        chapters: [],
      }));
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

      return {
        ...nonprofit,
        chapters: [],
      };
    },
  },

  Nonprofit: {
    chapters: async (parent: NonprofitParent) => {
      const rows = (await prisma.nonprofit_chapter_project.findMany({
        where: { nonprofit_id: parent.nonprofit_id },
        select: {
          project_status: true,
          chapter_id: true,
          chapters: {
            select: {
              chapter_id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })) as ChapterRow[];

      if (!rows.length) return [];

      const rowsWithChapter = rows.filter(
        (
          r
        ): r is ChapterRow & {
          chapters: { chapter_id: string; name: string };
        } => r.chapters !== null
      );

      const seen = new Set<string>();
      const deduped = rowsWithChapter.filter((r) => {
        const id = r.chapters.chapter_id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return deduped.map((r) => ({
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
