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

      return getNonprofitsWithFilters(serviceArgs);
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
    chapter_projects: async (parent: { nonprofit_id: string }) => {
      const joinRows = await prisma.nonprofit_chapter_project.findMany({
        where: {
          nonprofit_id: parent.nonprofit_id,
          chapter_id: { not: null },
        },
        select: {
          chapter_id: true,
          project_id: true,
          project_status: true,
          start_date: true,
          end_date: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      });

      console.log('[chapter_projects] nonprofit:', parent.nonprofit_id);
      console.log('[chapter_projects] joinRows length:', joinRows.length);
      if (joinRows.length > 0) {
        console.log('[chapter_projects] sample row:', joinRows[0]);
      }

      if (joinRows.length === 0) return [];

      const seen = new Set<string>();
      const deduped = joinRows.filter((r) => {
        const chapterId = r.chapter_id;
        if (!chapterId) return false;
        const key = `${chapterId}::${r.project_id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const chapterIds = Array.from(
        new Set(deduped.map((r) => r.chapter_id).filter(Boolean) as string[])
      );
      const projectIds = Array.from(new Set(deduped.map((r) => r.project_id)));

      const [chapters, projects] = await Promise.all([
        prisma.chapters.findMany({
          where: { chapter_id: { in: chapterIds } },
          select: { chapter_id: true, name: true },
        }),
        prisma.projects.findMany({
          where: { project_id: { in: projectIds } },
          select: { project_id: true, name: true, repo: true },
        }),
      ]);

      console.log('[chapter_projects] chapters found:', chapters.length);
      console.log('[chapter_projects] projects found:', projects.length);

      const chapterNameById = new Map(
        chapters.map((c) => [c.chapter_id, c.name])
      );
      const projectById = new Map(projects.map((p) => [p.project_id, p]));

      return deduped.map((r) => {
        const chapterId = r.chapter_id as string;

        const chapterName = chapterNameById.get(chapterId);
        const project = projectById.get(r.project_id);

        if (!chapterName) {
          throw new GraphQLError(
            `Data issue: chapter_id ${chapterId} exists in nonprofit_chapter_project but no matching chapters row`
          );
        }
        if (!project) {
          throw new GraphQLError(
            `Data issue: project_id ${r.project_id} exists in nonprofit_chapter_project but no matching projects row`
          );
        }

        return {
          chapter_id: chapterId,
          chapter_name: chapterName,
          project_id: project.project_id,
          project_name: project.name,
          repo: project.repo,
          project_status:
            r.project_status === status_type.ACTIVE ? 'ACTIVE' : 'INACTIVE',
          start_date: r.start_date.toISOString(),
          end_date: r.end_date ? r.end_date.toISOString() : null,
        };
      });
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
