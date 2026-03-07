import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createSocialLinkSchema, updateSocialLinkSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;

export async function getAllSocialLinks() {
  try {
    logger.info('Fetching all social links');
    const links = await prisma.social_links.findMany({
      orderBy: { link_id: 'asc' },
    });

    logger.info('Successfully retrieved social links', {
      count: links.length,
    });

    return links;
  } catch (error) {
    logger.error('Failed to fetch social links', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve social links');
  }
}

export async function getSocialLinkById(id: string) {
  try {
    logger.info('Fetching social link by ID', { linkId: id });

    const link = await prisma.social_links.findUnique({
      where: { link_id: id },
    });

    if (!link) {
      logger.warn('Social link not found', { linkId: id });
      throw new NotFoundError('SocialLink', id);
    }

    logger.info('Successfully retrieved social link', { linkId: id });

    return link;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch social link by ID', {
      linkId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve social link');
  }
}

export async function createSocialLink(data: CreateSocialLinkInput) {
  try {
    logger.info('Creating new social link');

    const link = await prisma.social_links.create({ data });

    logger.info('Successfully created social link', {
      linkId: link.link_id,
    });

    return link;
  } catch (error) {
    logger.error('Failed to create social link', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create social link');
  }
}

export async function updateSocialLink(
  id: string,
  data: UpdateSocialLinkInput
) {
  try {
    logger.info('Updating social link', { linkId: id, updateData: data });

    const link = await prisma.social_links.update({
      where: { link_id: id },
      data,
    });

    logger.info('Successfully updated social link', { linkId: id });

    return link;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('SocialLink', id);
    }

    logger.error('Failed to update social link', {
      linkId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update social link');
  }
}

export async function deleteSocialLink(id: string) {
  try {
    logger.info('Deleting social link', { linkId: id });

    const link = await prisma.social_links.delete({
      where: { link_id: id },
    });

    logger.info('Successfully deleted social link', { linkId: id });

    return link;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('SocialLink', id);
    }

    logger.error('Failed to delete social link', {
      linkId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete social link');
  }
}
