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
          project_contact_id: true,
          collab_contact_id: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      });

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

      const contactIds = Array.from(
        new Set(
          deduped
            .flatMap((r) => [r.project_contact_id, r.collab_contact_id])
            .filter(Boolean) as string[]
        )
      );
      const [chapters, projects, contacts] = await Promise.all([
        prisma.chapters.findMany({
          where: { chapter_id: { in: chapterIds } },
        }),
        prisma.projects.findMany({
          where: { project_id: { in: projectIds } },
          select: { project_id: true, name: true, repo: true },
        }),
        contactIds.length
          ? prisma.contacts.findMany({
              where: { contact_id: { in: contactIds } },
            })
          : Promise.resolve([]),
      ]);

      const chapterById = new Map(chapters.map((c) => [c.chapter_id, c]));
      const projectById = new Map(projects.map((p) => [p.project_id, p]));
      const contactById = new Map(contacts.map((c) => [c.contact_id, c]));

      return deduped.map((r) => {
        const chapterId = r.chapter_id as string;

        const chapter = chapterById.get(chapterId);
        const project = projectById.get(r.project_id);

        if (!chapter) {
          throw new GraphQLError(
            `Data issue: chapter_id ${chapterId} exists in nonprofit_chapter_project but no matching chapters row`
          );
        }
        if (!project) {
          throw new GraphQLError(
            `Data issue: project_id ${r.project_id} exists in nonprofit_chapter_project but no matching projects row`
          );
        }

        const projectContact = r.project_contact_id
          ? (contactById.get(r.project_contact_id) ?? null)
          : null;

        const collabContact = r.collab_contact_id
          ? (contactById.get(r.collab_contact_id) ?? null)
          : null;

        return {
          chapter: {
            ...chapter,
            created_at: chapter.created_at.toISOString(),
            updated_at: chapter.updated_at.toISOString(),
          },

          project,
          project_status: r.project_status,
          start_date: r.start_date.toISOString(),
          end_date: r.end_date ? r.end_date.toISOString() : null,

          project_contact: projectContact
            ? {
                ...projectContact,
                created_at: projectContact.created_at.toISOString(),
                updated_at: projectContact.updated_at.toISOString(),
              }
            : null,

          collab_contact: collabContact
            ? {
                ...collabContact,
                created_at: collabContact.created_at.toISOString(),
                updated_at: collabContact.updated_at.toISOString(),
              }
            : null,
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
