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

interface ChapterProjectsRow {
  nonprofit_chapter_project_id: string;
  nonprofit_id: string;
  project_status: status_type;
  start_date: Date;
  end_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  chapters: { chapter_id: string; name: string } | null;
  projects: {
    project_id: string;
    name: string;
    repo: string | null;
    project_type: string | null;
    budget: number | null;
  } | null;
  contacts_nonprofit_chapter_project_project_contact_idTocontacts: {
    contact_id: string;
    name: string;
    email: string;
    phone_number: string | null;
    created_at: Date;
    updated_at: Date;
  } | null;
  contacts_nonprofit_chapter_project_collab_contact_idTocontacts: {
    contact_id: string;
    name: string;
    email: string;
    phone_number: string | null;
    created_at: Date;
    updated_at: Date;
  } | null;
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
        throw new GraphQLError('Nonprofit not found');
      }

      return nonprofit;
    },
  },

  Nonprofit: {
    chapter_projects: async (parent: NonprofitParent) => {
      const rows = (await prisma.nonprofit_chapter_project.findMany({
        where: { nonprofit_id: parent.nonprofit_id },
        select: {
          nonprofit_chapter_project_id: true,
          nonprofit_id: true,
          project_status: true,
          start_date: true,
          end_date: true,
          notes: true,
          created_at: true,
          updated_at: true,

          chapters: {
            select: {
              chapter_id: true,
              name: true,
            },
          },

          projects: {
            select: {
              project_id: true,
              name: true,
              repo: true,
              project_type: true,
              budget: true,
            },
          },

          contacts_nonprofit_chapter_project_project_contact_idTocontacts: {
            select: {
              contact_id: true,
              name: true,
              email: true,
              phone_number: true,
              created_at: true,
              updated_at: true,
            },
          },

          contacts_nonprofit_chapter_project_collab_contact_idTocontacts: {
            select: {
              contact_id: true,
              name: true,
              email: true,
              phone_number: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })) as ChapterProjectsRow[];

      if (!rows.length) return [];

      const valid = rows.filter(
        (
          r
        ): r is ChapterProjectsRow & {
          chapters: { chapter_id: string; name: string };
          projects: {
            project_id: string;
            name: string;
            repo: string | null;
            project_type: string | null;
            budget: number | null;
          };
        } => r.chapters !== null && r.projects !== null
      );

      return valid.map((r) => {
        const chapter = r.chapters;
        const project = r.projects;

        return {
          nonprofit_chapter_project_id: r.nonprofit_chapter_project_id,
          nonprofit_id: r.nonprofit_id,

          chapter: {
            chapter_id: chapter.chapter_id,
            name: chapter.name,
          },

          project: {
            project_id: project.project_id,
            name: project.name,
            repo: project.repo,
            project_type: project.project_type,
            budget: project.budget,
          },

          project_status:
            r.project_status === status_type.ACTIVE ? 'ACTIVE' : 'INACTIVE',

          start_date: r.start_date.toISOString(),
          end_date: r.end_date ? r.end_date.toISOString() : null,

          notes: r.notes,

          project_contact:
            r.contacts_nonprofit_chapter_project_project_contact_idTocontacts,

          collab_contact:
            r.contacts_nonprofit_chapter_project_collab_contact_idTocontacts,

          created_at: r.created_at.toISOString(),
          updated_at: r.updated_at.toISOString(),
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
