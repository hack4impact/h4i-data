import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import {
  createProjectRoleSchema,
  updateProjectRoleSchema,
} from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

type CreateProjectRoleInput = z.infer<typeof createProjectRoleSchema>;
type UpdateProjectRoleInput = z.infer<typeof updateProjectRoleSchema>;

export async function getAllProjectRoles() {
  try {
    logger.info('Fetching all project roles');
    const roles = await prisma.project_roles.findMany({
      orderBy: { name: 'asc' },
    });

    logger.info('Successfully retrieved project roles', {
      count: roles.length,
    });

    return roles;
  } catch (error) {
    logger.error('Failed to fetch project roles', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project roles');
  }
}

export async function getProjectRoleById(id: string) {
  try {
    logger.info('Fetching project role by ID', { roleId: id });

    const role = await prisma.project_roles.findUnique({
      where: { project_role_id: id },
    });

    if (!role) {
      logger.warn('Project role not found', { roleId: id });
      throw new NotFoundError('ProjectRole', id);
    }

    logger.info('Successfully retrieved project role', { roleId: id });

    return role;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    logger.error('Failed to fetch project role by ID', {
      roleId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve project role');
  }
}

export async function createProjectRole(data: CreateProjectRoleInput) {
  try {
    logger.info('Creating new project role');

    const role = await prisma.project_roles.create({ data });

    logger.info('Successfully created project role', {
      roleId: role.project_role_id,
    });

    return role;
  } catch (error) {
    logger.error('Failed to create project role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create project role');
  }
}

export async function updateProjectRole(
  id: string,
  data: UpdateProjectRoleInput
) {
  try {
    logger.info('Updating project role', { roleId: id, updateData: data });

    const role = await prisma.project_roles.update({
      where: { project_role_id: id },
      data,
    });

    logger.info('Successfully updated project role', { roleId: id });

    return role;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectRole', id);
    }

    logger.error('Failed to update project role', {
      roleId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to update project role');
  }
}

export async function deleteProjectRole(id: string) {
  try {
    logger.info('Deleting project role', { roleId: id });

    const role = await prisma.project_roles.delete({
      where: { project_role_id: id },
    });

    logger.info('Successfully deleted project role', { roleId: id });

    return role;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('ProjectRole', id);
    }

    logger.error('Failed to delete project role', {
      roleId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to delete project role');
  }
}
