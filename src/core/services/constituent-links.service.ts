import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createConstituentLinkSchema,
  updateConstituentLinkSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateConstituentLinkInput = z.infer<typeof createConstituentLinkSchema>;
type UpdateConstituentLinkInput = z.infer<typeof updateConstituentLinkSchema>;

export async function getAllConstituentLinks() {
  try {
    logger.info('Fetching all constituent links');
    const links = await prisma.constituent_links.findMany({
      orderBy: { constituent_link_id: 'asc' },
    });

    logger.info('Successfully retrieved constituent links', {
      count: links.length,
    });

    return links;
  } catch (error) {
    logger.error('Failed to fetch constituent links', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve constituent links');
  }
}

export async function getConstituentLinkById(id: string) {
  try {
    logger.info('Fetching constituent link by ID', { linkId: id });

    const link = await prisma.constituent_links.findUnique({
      where: { constituent_link_id: id },
    });

    if (!link) {
      logger.warn('Constituent link not found', { linkId: id });
      throw new NotFoundError('ConstituentLink', id);
    }

    logger.info('Successfully retrieved constituent link', { linkId: id });

    return link;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch constituent link by ID', {
      linkId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve constituent link');
  }
}

export async function createConstituentLink(data: CreateConstituentLinkInput) {
  try {
    logger.info('Creating new constituent link');

    const link = await prisma.constituent_links.create({ data });

    logger.info('Successfully created constituent link', {
      linkId: link.constituent_link_id,
    });

    return link;
  } catch (error) {
    logger.error('Failed to create constituent link', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create constituent link');
  }
}

export async function updateConstituentLink(
  id: string,
  data: UpdateConstituentLinkInput
) {
  try {
    logger.info('Updating constituent link', { linkId: id, updateData: data });

    const link = await prisma.constituent_links.update({
      where: { constituent_link_id: id },
      data,
    });

    logger.info('Successfully updated constituent link', { linkId: id });

    return link;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ConstituentLink', id);
    }

    logger.error('Failed to update constituent link', {
      linkId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update constituent link');
  }
}

export async function deleteConstituentLink(id: string) {
  try {
    logger.info('Deleting constituent link', { linkId: id });

    const link = await prisma.constituent_links.delete({
      where: { constituent_link_id: id },
    });

    logger.info('Successfully deleted constituent link', { linkId: id });

    return link;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ConstituentLink', id);
    }

    logger.error('Failed to delete constituent link', {
      linkId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete constituent link');
  }
}
