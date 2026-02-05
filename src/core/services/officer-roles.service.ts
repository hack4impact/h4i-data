import { prisma } from '../../config/database';
import {
  createOfficerRoleSchema,
  updateOfficerRoleSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

type CreateOfficerRoleInput = z.infer<typeof createOfficerRoleSchema>;
type UpdateOfficerRoleInput = z.infer<typeof updateOfficerRoleSchema>;

export async function getAllOfficerRoles() {
  try {
    logger.info('Fetching all officer roles');
    const roles = await prisma.officer_roles.findMany({
      orderBy: { name: 'asc' },
    });

    logger.info('Successfully retrieved officer roles', {
      count: roles.length,
    });
    return roles;
  } catch (error) {
    logger.error('Failed to fetch officer roles', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve officer roles');
  }
}

export async function getOfficerRoleById(id: string) {
  try {
    logger.info('Fetching officer role by ID', { roleId: id });

    const role = await prisma.officer_roles.findUnique({
      where: { role_id: id },
    });

    if (!role) {
      logger.warn('Officer role not found', { roleId: id });
      throw new NotFoundError('OfficerRole', id);
    }

    logger.info('Successfully retrieved officer role', {
      roleId: id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch officer role by ID', {
      roleId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve officer role');
  }
}

export async function createOfficerRole(data: CreateOfficerRoleInput) {
  try {
    logger.info('Creating new officer role', {
      roleName: data.name,
      roleData: data,
    });

    const validated = createOfficerRoleSchema.parse(data);
    const role = await prisma.officer_roles.create({ data: validated });

    logger.info('Successfully created officer role', {
      roleId: role.role_id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    logger.error('Failed to create officer role', {
      roleData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create officer role');
  }
}

export async function updateOfficerRole(
  id: string,
  data: UpdateOfficerRoleInput
) {
  try {
    logger.info('Updating officer role', { roleId: id, updateData: data });

    const validated = updateOfficerRoleSchema.parse(data);
    const role = await prisma.officer_roles.update({
      where: { role_id: id },
      data: validated,
    });

    logger.info('Successfully updated officer role', {
      roleId: id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    logger.error('Failed to update officer role', {
      roleId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('OfficerRole', id);
    }

    throw new DatabaseError('Failed to update officer role');
  }
}

export async function deleteOfficerRole(id: string) {
  try {
    logger.info('Deleting officer role', { roleId: id });

    const role = await prisma.officer_roles.delete({
      where: { role_id: id },
    });

    logger.info('Successfully deleted officer role', {
      roleId: id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    logger.error('Failed to delete officer role', {
      roleId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('OfficerRole', id);
    }

    throw new DatabaseError('Failed to delete officer role');
  }
}
