import {
  getAllProjectRoles,
  getProjectRoleById,
  createProjectRole,
  updateProjectRole,
  deleteProjectRole,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    project_roles: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Project Role Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjectRoles', () => {
    it('should return an array of project roles', async () => {
      const mockRoles = [
        {
          role_id: '1',
          name: 'Tech Lead',
          is_leadership: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.project_roles.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await getAllProjectRoles();

      expect(result).toEqual(mockRoles);
    });

    it('should return empty array when no project roles exist', async () => {
      (prisma.project_roles.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllProjectRoles();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.project_roles.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllProjectRoles()).rejects.toThrow(
        'Failed to retrieve project roles'
      );
    });
  });

  describe('getProjectRoleById', () => {
    it('should return a single project role when a valid ID is provided', async () => {
      const roleId = '1';
      const mockRole = {
        role_id: roleId,
        name: 'Tech Lead',
        is_leadership: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_roles.findUnique as jest.Mock).mockResolvedValue(
        mockRole
      );

      const result = await getProjectRoleById(roleId);

      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundError if no project role is found', async () => {
      const roleId = 'non-existent-id';
      (prisma.project_roles.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProjectRoleById(roleId)).rejects.toThrow(
        "ProjectRole with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.project_roles.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getProjectRoleById('1')).rejects.toThrow(
        'Failed to retrieve project role'
      );
    });
  });

  describe('createProjectRole', () => {
    it('should create and return a new project role', async () => {
      const inputData = {
        name: 'Developer',
        is_leadership: false,
      };
      const createdRole = {
        role_id: 'new-id-123',
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.project_roles.create as jest.Mock).mockResolvedValue(createdRole);

      const result = await createProjectRole(inputData);

      expect(result).toEqual(createdRole);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.project_roles.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createProjectRole({ name: 'Developer', is_leadership: false })
      ).rejects.toThrow('Failed to create project role');
    });
  });

  describe('updateProjectRole', () => {
    it('should update and return the project role', async () => {
      const roleId = '1';
      const updateData = { name: 'Senior Tech Lead' };
      const updatedRole = {
        role_id: roleId,
        name: 'Senior Tech Lead',
        is_leadership: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_roles.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await updateProjectRole(roleId, updateData);

      expect(result).toEqual(updatedRole);
    });

    it('should throw NotFoundError when updating non-existent project role', async () => {
      (prisma.project_roles.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateProjectRole('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow("ProjectRole with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.project_roles.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(updateProjectRole('1', { name: 'Updated' })).rejects.toThrow(
        'Failed to update project role'
      );
    });
  });

  describe('deleteProjectRole', () => {
    it('should call delete with the correct ID and return the deleted project role', async () => {
      const roleId = '1';
      const deletedRole = {
        role_id: roleId,
        name: 'Tech Lead',
        is_leadership: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_roles.delete as jest.Mock).mockResolvedValue(deletedRole);

      const result = await deleteProjectRole(roleId);

      expect(result).toEqual(deletedRole);
    });

    it('should throw NotFoundError when deleting non-existent project role', async () => {
      (prisma.project_roles.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteProjectRole('non-existent-id')).rejects.toThrow(
        "ProjectRole with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.project_roles.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteProjectRole('1')).rejects.toThrow(
        'Failed to delete project role'
      );
    });
  });
});
