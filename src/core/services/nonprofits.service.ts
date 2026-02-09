import { prisma } from '../../config/database';
import { createNonprofitSchema, updateNonprofitSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';
import { Prisma, status_type } from '@prisma/client';

type CreateNonprofitInput = z.infer<typeof createNonprofitSchema>;
type UpdateNonprofitInput = z.infer<typeof updateNonprofitSchema>;

// Types for filtering and sorting
export type StatusType = 'ACTIVE' | 'INACTIVE';
export type NonprofitSortOption =
  | 'A_TO_Z'
  | 'Z_TO_A'
  | 'MOST_RECENT'
  | 'STATUS';

export interface GetNonprofitsFilters {
  statuses?: StatusType[];
  sort?: NonprofitSortOption[];
}

export interface EnrichedNonprofit {
  nonprofit_id: string;
  name: string;
  mission: string;
  website: string | null;
  location_id: string | null;
  contact_id: string;
  created_at: Date;
  updated_at: Date;
  status: StatusType;
  latestStartDate?: Date | null;
}

/**
 * Helper function to determine if a nonprofit is ACTIVE based on its projects
 */
function deriveNonprofitStatus(
  projects: {
    project_status: status_type | string;
    end_date: Date | null;
  }[]
): StatusType {
  const now = new Date();
  const hasOngoingProject = projects.some((project) => {
    const isActive =
      project.project_status === status_type.ACTIVE ||
      project.project_status === 'ACTIVE';

    const notEnded =
      project.end_date === null || new Date(project.end_date) > now;

    return isActive && notEnded;
  });
  return hasOngoingProject ? 'ACTIVE' : 'INACTIVE';
}

/**
 * Helper function to get the latest start_date from projects
 */
function getLatestStartDate(projects: { start_date: Date }[]): Date | null {
  if (projects.length === 0) return null;
  return projects.reduce(
    (latest, project) => {
      const startDate = new Date(project.start_date);
      return !latest || startDate > latest ? startDate : latest;
    },
    null as Date | null
  );
}

/**
 * Comparator function for sorting nonprofits
 */
function createNonprofitComparator(
  sortOptions: NonprofitSortOption[]
): (a: EnrichedNonprofit, b: EnrichedNonprofit) => number {
  return (a, b) => {
    for (const option of sortOptions) {
      let comparison = 0;

      switch (option) {
        case 'A_TO_Z':
          comparison = a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
          });
          break;

        case 'Z_TO_A':
          comparison = b.name.localeCompare(a.name, undefined, {
            sensitivity: 'base',
          });
          break;

        case 'MOST_RECENT': {
          // Sort by latest start date descending (newest first)
          // Nonprofits without projects go last
          const aDate = a.latestStartDate?.getTime() ?? -Infinity;
          const bDate = b.latestStartDate?.getTime() ?? -Infinity;
          comparison = bDate - aDate;
          break;
        }

        case 'STATUS':
          // ACTIVE before INACTIVE
          if (a.status === 'ACTIVE' && b.status === 'INACTIVE') {
            comparison = -1;
          } else if (a.status === 'INACTIVE' && b.status === 'ACTIVE') {
            comparison = 1;
          }
          break;
      }

      if (comparison !== 0) {
        return comparison;
      }
    }
    return 0;
  };
}

/**
 * Get nonprofits with optional filtering and sorting
 */
export async function getNonprofitsWithFilters(
  filters: GetNonprofitsFilters = {}
): Promise<EnrichedNonprofit[]> {
  try {
    const { statuses, sort } = filters;

    logger.info('Fetching nonprofits with filters', { filters });

    const now = new Date();

    const activeProjectWhere: Prisma.nonprofit_chapter_projectWhereInput = {
      project_status: status_type.ACTIVE,
      OR: [{ end_date: null }, { end_date: { gt: now } }],
    };

    const hasJoinFilters = statuses && statuses.length > 0;

    let nonprofitIdFilter: Prisma.nonprofitsWhereInput | undefined;

    if (hasJoinFilters) {
      const ncpWhere: Prisma.nonprofit_chapter_projectWhereInput = {};

      if (statuses?.length) {
        const wantsActive = statuses.includes('ACTIVE');
        const wantsInactive = statuses.includes('INACTIVE');

        // Only ACTIVE
        if (wantsActive && !wantsInactive) {
          Object.assign(ncpWhere, activeProjectWhere);
        }
        // Only INACTIVE
        else if (wantsInactive && !wantsActive) {
          ncpWhere.NOT = activeProjectWhere;
        }
      }

      const joinRows = await prisma.nonprofit_chapter_project.findMany({
        where: ncpWhere,
        select: { nonprofit_id: true },
      });

      if (joinRows.length === 0) return [];

      const nonprofitIds = [...new Set(joinRows.map((r) => r.nonprofit_id))];

      nonprofitIdFilter = {
        nonprofit_id: { in: nonprofitIds },
      };
    }

    const nonprofits = await prisma.nonprofits.findMany({
      where: nonprofitIdFilter,
      include: {
        nonprofit_chapter_project: {
          select: {
            start_date: true,
            end_date: true,
            project_status: true,
            chapter_id: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const enrichedNonprofits: EnrichedNonprofit[] = nonprofits.map((np) => {
      const status = deriveNonprofitStatus(np.nonprofit_chapter_project);
      const latestStartDate = getLatestStartDate(np.nonprofit_chapter_project);

      return {
        nonprofit_id: np.nonprofit_id,
        name: np.name,
        mission: np.mission,
        website: np.website,
        location_id: np.location_id,
        contact_id: np.contact_id,
        created_at: np.created_at,
        updated_at: np.updated_at,
        status,
        latestStartDate,
      };
    });

    let result = enrichedNonprofits;
    if (statuses?.length) {
      result = result.filter((np) => statuses.includes(np.status));
    }

    if (sort?.length) {
      const comparator = createNonprofitComparator(sort);
      result = [...result].sort(comparator);
    }

    logger.info('Successfully retrieved and filtered nonprofits', {
      count: result.length,
    });

    return result;
  } catch (error) {
    logger.error('Failed to fetch nonprofits with filters', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new DatabaseError('Failed to retrieve nonprofits');
  }
}

export async function getAllNonprofits() {
  try {
    logger.info('Fetching all nonprofits');
    const nonprofits = await prisma.nonprofits.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved nonprofits', {
      count: nonprofits.length,
    });

    return nonprofits;
  } catch (error) {
    logger.error('Failed to fetch nonprofits', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve nonprofits');
  }
}

export async function getNonprofitById(id: string): Promise<EnrichedNonprofit> {
  try {
    logger.info('Fetching nonprofit by ID', { nonprofitId: id });

    const nonprofit = await prisma.nonprofits.findUnique({
      where: { nonprofit_id: id },
      include: {
        nonprofit_chapter_project: {
          select: {
            start_date: true,
            end_date: true,
            project_status: true,
            chapter_id: true,
          },
        },
      },
    });

    if (!nonprofit) {
      logger.warn('Nonprofit not found', { nonprofitId: id });
      throw new NotFoundError('Nonprofit', id);
    }

    // Derive status and latest start date
    const status = deriveNonprofitStatus(nonprofit.nonprofit_chapter_project);
    const latestStartDate = getLatestStartDate(
      nonprofit.nonprofit_chapter_project
    );

    logger.info('Successfully retrieved nonprofit', {
      nonprofitId: id,
      nonprofitName: nonprofit.name,
      status,
    });

    return {
      nonprofit_id: nonprofit.nonprofit_id,
      name: nonprofit.name,
      mission: nonprofit.mission,
      website: nonprofit.website,
      location_id: nonprofit.location_id,
      contact_id: nonprofit.contact_id,
      created_at: nonprofit.created_at,
      updated_at: nonprofit.updated_at,
      status,
      latestStartDate,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch nonprofit by ID', {
      nonprofittId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve nonprofit');
  }
}

export async function createNonprofit(
  input: CreateNonprofitInput
): Promise<EnrichedNonprofit> {
  try {
    logger.info('Creating new nonprofit', {
      nonprofitName: input.name,
      nonprofitData: input,
    });

    // Destructure and include only defined optionals
    const { name, mission, contact_id, website, location_id } = input;

    const data: Prisma.nonprofitsUncheckedCreateInput = {
      name,
      mission,
      contact_id,
      ...(website === undefined ? {} : { website }), // include if not undefined (can be null)
      ...(location_id === undefined ? {} : { location_id }), // include if not undefined (can be null)
    };

    const nonprofit = await prisma.nonprofits.create({
      data,
      include: {
        nonprofit_chapter_project: {
          select: {
            start_date: true,
            end_date: true,
            project_status: true,
            chapter_id: true,
          },
        },
      },
    });

    // Derive status and latest start date
    const status = deriveNonprofitStatus(nonprofit.nonprofit_chapter_project);
    const latestStartDate = getLatestStartDate(
      nonprofit.nonprofit_chapter_project
    );

    logger.info('Successfully created nonprofit', {
      nonprofitId: nonprofit.nonprofit_id,
      nonprofitName: nonprofit.name,
      status,
    });

    return {
      nonprofit_id: nonprofit.nonprofit_id,
      name: nonprofit.name,
      mission: nonprofit.mission,
      website: nonprofit.website,
      location_id: nonprofit.location_id,
      contact_id: nonprofit.contact_id,
      created_at: nonprofit.created_at,
      updated_at: nonprofit.updated_at,
      status,
      latestStartDate,
    };
  } catch (error) {
    logger.error('Failed to create nonprofit', {
      nonprofitData: input,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create nonprofit');
  }
}

export async function updateNonprofit(
  id: string,
  input: UpdateNonprofitInput
): Promise<EnrichedNonprofit> {
  try {
    logger.info('Updating nonprofit', {
      nonprofitId: id,
      updateData: input,
    });

    const { name, mission, contact_id, website, location_id } = input;

    const data: Prisma.nonprofitsUncheckedUpdateInput = {
      ...(name === undefined ? {} : { name }),
      ...(mission === undefined ? {} : { mission }),
      ...(contact_id === undefined ? {} : { contact_id }),
      ...(website === undefined ? {} : { website }), // null clears it
      ...(location_id === undefined ? {} : { location_id }), // null clears it
    };

    const nonprofit = await prisma.nonprofits.update({
      where: { nonprofit_id: id },
      data,
      include: {
        nonprofit_chapter_project: {
          select: {
            start_date: true,
            end_date: true,
            project_status: true,
            chapter_id: true,
          },
        },
      },
    });

    // Derive status and latest start date
    const status = deriveNonprofitStatus(nonprofit.nonprofit_chapter_project);
    const latestStartDate = getLatestStartDate(
      nonprofit.nonprofit_chapter_project
    );

    logger.info('Successfully updated nonprofit', {
      nonprofitId: id,
      nonprofitName: nonprofit.name,
      status,
    });

    return {
      nonprofit_id: nonprofit.nonprofit_id,
      name: nonprofit.name,
      mission: nonprofit.mission,
      website: nonprofit.website,
      location_id: nonprofit.location_id,
      contact_id: nonprofit.contact_id,
      created_at: nonprofit.created_at,
      updated_at: nonprofit.updated_at,
      status,
      latestStartDate,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Nonprofit', id); // maps to 404
    }

    logger.error('Failed to update nonprofit', {
      nonprofitId: id,
      updateData: input,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Nonprofit', id);
    }

    throw new DatabaseError('Failed to update nonprofit');
  }
}

export async function deleteNonprofit(id: string): Promise<EnrichedNonprofit> {
  try {
    logger.info('Deleting nonprofit', { nonprofitId: id });

    // Fetch the nonprofit with projects before deleting to return enriched data
    const nonprofit = await prisma.nonprofits.findUnique({
      where: { nonprofit_id: id },
      include: {
        nonprofit_chapter_project: {
          select: {
            start_date: true,
            end_date: true,
            project_status: true,
            chapter_id: true,
          },
        },
      },
    });

    if (!nonprofit) {
      throw new NotFoundError('Nonprofit', id);
    }

    // Derive status and latest start date before deleting
    const status = deriveNonprofitStatus(nonprofit.nonprofit_chapter_project);
    const latestStartDate = getLatestStartDate(
      nonprofit.nonprofit_chapter_project
    );

    // Now delete the nonprofit
    await prisma.nonprofits.delete({
      where: { nonprofit_id: id },
    });

    logger.info('Successfully deleted nonprofit', {
      nonprofitId: id,
      nonprofitName: nonprofit.name,
      status,
    });

    return {
      nonprofit_id: nonprofit.nonprofit_id,
      name: nonprofit.name,
      mission: nonprofit.mission,
      website: nonprofit.website,
      location_id: nonprofit.location_id,
      contact_id: nonprofit.contact_id,
      created_at: nonprofit.created_at,
      updated_at: nonprofit.updated_at,
      status,
      latestStartDate,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Nonprofit', id); // maps to 404
    }

    logger.error('Failed to delete nonprofit', {
      nonprofitId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if nonprofit doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Nonprofit', id);
    }

    throw new DatabaseError('Failed to delete nonprofit');
  }
}

export async function getChapterIdsByNames(names: string[]): Promise<string[]> {
  const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (cleaned.length === 0) return [];

  const chapters = await prisma.chapters.findMany({
    where: { name: { in: cleaned } },
    select: { chapter_id: true },
  });

  return chapters.map((c) => c.chapter_id);
}
