// src/core/services/company.service.ts
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { createCompanySchema, updateCompanySchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateCompanyInput = z.infer<typeof createCompanySchema>;
type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export async function getAllCompanies() {
  try {
    logger.info('Fetching all companies');
    const companies = await prisma.companies.findMany({
      orderBy: { name: 'asc' },
    });

    logger.info('Successfully retrieved companies', {
      count: companies.length,
    });

    return companies;
  } catch (error) {
    logger.error('Failed to fetch companies', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve companies');
  }
}

export async function getCompanyById(id: string) {
  try {
    logger.info('Fetching company by ID', { companyId: id });

    const company = await prisma.companies.findUnique({
      where: { company_id: id },
    });

    if (!company) {
      logger.warn('Company not found', { companyId: id });
      throw new NotFoundError('Company', id);
    }

    logger.info('Successfully retrieved company', {
      companyId: id,
      companyName: company.name,
    });

    return company;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch company by ID', {
      companyId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve company');
  }
}

export async function createCompany(data: CreateCompanyInput) {
  try {
    logger.info('Creating new company', { companyName: data.name });

    const company = await prisma.companies.create({ data });

    logger.info('Successfully created company', {
      companyId: company.company_id,
      companyName: company.name,
    });

    return company;
  } catch (error) {
    logger.error('Failed to create company', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create company');
  }
}

export async function updateCompany(id: string, data: UpdateCompanyInput) {
  try {
    logger.info('Updating company', {
      companyId: id,
      updateData: data,
    });

    const company = await prisma.companies.update({
      where: { company_id: id },
      data,
    });

    logger.info('Successfully updated company', {
      companyId: id,
      companyName: company.name,
    });

    return company;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Company', id);
    }

    logger.error('Failed to update company', {
      companyId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update company');
  }
}

export async function deleteCompany(id: string) {
  try {
    logger.info('Deleting company', { companyId: id });

    const company = await prisma.companies.delete({
      where: { company_id: id },
    });

    logger.info('Successfully deleted company', {
      companyId: id,
      companyName: company.name,
    });

    return company;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Company', id);
    }

    logger.error('Failed to delete company', {
      companyId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete company');
  }
}
