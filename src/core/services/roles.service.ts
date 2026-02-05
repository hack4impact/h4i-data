import { prisma } from '../../config/database';
import { createRoleSchema, updateRoleSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Infer types from your Zod schemas
type CreateRoleInput = z.infer<typeof createRoleSchema>;
type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export async function getAllRoles() {
  try {
    logger.info('Fetching all roles');
    const roles = await prisma.roles.findMany({
      orderBy: { name: 'asc' },
    });

    logger.info('Successfully retrieved roles', { count: roles.length });
    return roles;
  } catch (error) {
    logger.error('Failed to fetch roles', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve roles');
  }
}

export async function getRoleById(id: string) {
  try {
    logger.info('Fetching role by ID', { roleId: id });

    const role = await prisma.roles.findUnique({
      where: { role_id: id },
    });

    if (!role) {
      logger.warn('Role not found', { roleId: id });
      throw new NotFoundError('Role', id);
    }

    logger.info('Successfully retrieved role', {
      roleId: id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch role by ID', {
      roleId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve role');
  }
}

export async function createRole(data: CreateRoleInput) {
  try {
    logger.info('Creating new role', {
      roleName: data.name,
      roleData: data,
    });

    const validated = createRoleSchema.parse(data);
    const role = await prisma.roles.create({ data: validated });

    logger.info('Successfully created role', {
      roleId: role.role_id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    logger.error('Failed to create role', {
      roleData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create role');
  }
}

export async function updateRole(id: string, data: UpdateRoleInput) {
  try {
    logger.info('Updating role', { roleId: id, updateData: data });

    const validated = updateRoleSchema.parse(data);
    const role = await prisma.roles.update({
      where: { role_id: id },
      data: validated,
    });

    logger.info('Successfully updated role', {
      roleId: id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    logger.error('Failed to update role', {
      roleId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Role', id);
    }

    throw new DatabaseError('Failed to update role');
  }
}

export async function deleteRole(id: string) {
  try {
    logger.info('Deleting role', { roleId: id });

    const role = await prisma.roles.delete({
      where: { role_id: id },
    });

    logger.info('Successfully deleted role', {
      roleId: id,
      roleName: role.name,
    });

    return role;
  } catch (error) {
    logger.error('Failed to delete role', {
      roleId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Role', id);
    }

    throw new DatabaseError('Failed to delete role');
  }
}
