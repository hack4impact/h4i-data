import { prisma } from '../../config/database';
import { createPartnerSchema, updatePartnerSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;

export async function getAllPartners() {
  try {
    logger.info('Fetching all partners');
    const partners = await prisma.partners.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved partners', {
      count: partners.length,
    });

    return partners;
  } catch (error) {
    logger.error('Failed to fetch partners', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve partners');
  }
}

export async function getPartnerById(id: string) {
  try {
    logger.info('Fetching partner by ID', { partnerId: id });

    const partner = await prisma.partners.findUnique({
      where: { partner_id: id },
    });

    if (!partner) {
      logger.warn('Partner not found', { partnerId: id });
      throw new NotFoundError('Partner', id);
    }

    logger.info('Successfully retrieved partner', {
      partnerId: id,
      partnerName: partner.legal_name,
    });

    return partner;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch partner by ID', {
      partnerId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve partner');
  }
}

export async function createPartner(input: CreatePartnerInput) {
  try {
    logger.info('Creating new partner', { partnerName: input.legal_name });

    const partner = await prisma.partners.create({
      data: input,
    });

    logger.info('Successfully created partner', {
      partnerId: partner.partner_id,
      partnerName: partner.legal_name,
    });

    return partner;
  } catch (error) {
    logger.error('Failed to create partner', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create partner');
  }
}

export async function updatePartner(id: string, input: UpdatePartnerInput) {
  try {
    logger.info('Updating partner', {
      partnerId: id,
      updateData: input,
    });

    const partner = await prisma.partners.update({
      where: { partner_id: id },
      data: input,
    });

    logger.info('Successfully updated partner', {
      partnerId: id,
      partnerName: partner.legal_name,
    });

    return partner;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Partner', id);
    }

    logger.error('Failed to update partner', {
      partnerId: id,
      updateData: input,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new DatabaseError('Failed to update partner');
  }
}

export async function deletePartner(id: string) {
  try {
    logger.info('Deleting partner', { partnerId: id });

    const partner = await prisma.partners.delete({
      where: { partner_id: id },
    });

    logger.info('Successfully deleted partner', {
      partnerId: id,
      partnerName: partner.legal_name,
    });

    return partner;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Partner', id);
    }

    logger.error('Failed to delete partner', {
      partnerId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new DatabaseError('Failed to delete partner');
  }
}
