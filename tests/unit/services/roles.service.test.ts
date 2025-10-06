import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { level_type as LevelType } from '@prisma/client';

// Mock the entire prisma module
jest.mock('../../../src/config/database', () => ({
  prisma: {
    roles: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Role Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRoles', () => {
    it('should return an array of roles', async () => {
      const mockRoles = [
        {
          role_id: 'role-1',
          name: 'Admin',
          description: 'Full access',
          permissions: { manage_users: true, manage_events: true },
          level_type: LevelType.REGULAR_CHAPTER_VOLUNTEER_LEVEL,
        },
      ];

      (prisma.roles.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(prisma.roles.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRoleById', () => {
    it('should return a single role when a valid ID is provided', async () => {
      const roleId = 'role-1';
      const mockRole = {
        role_id: roleId,
        name: 'Editor',
        description: 'Can edit content',
        permissions: { edit_content: true },
        level_type: LevelType.REGULAR_CHAPTER_VOLUNTEER_LEVEL,
      };

      (prisma.roles.findUnique as jest.Mock).mockResolvedValue(mockRole);

      const result = await getRoleById(roleId);

      expect(result).toEqual(mockRole);
      expect(prisma.roles.findUnique).toHaveBeenCalledWith({
        where: { role_id: roleId },
      });
    });

    it("should throw NotFoundError if the role doesn't exist", async () => {
      const roleId = 'missing-role';
      (prisma.roles.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getRoleById(roleId)).rejects.toThrow(
        "Role with id 'missing-role' not found"
      );
    });
  });

  describe('createRole', () => {
    it('should create and return a new role', async () => {
      const inputData = {
        name: 'Contributor',
        description: 'Limited content permissions',
        permissions: { create_posts: true },
        level_type: LevelType.REGULAR_CHAPTER_VOLUNTEER_LEVEL,
      };

      const createdRole = {
        role_id: 'role-new',
        ...inputData,
      };

      (prisma.roles.create as jest.Mock).mockResolvedValue(createdRole);

      const result = await createRole(inputData);

      expect(result).toEqual(createdRole);
      expect(prisma.roles.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });
  });

  describe('updateRole', () => {
    it('should update and return the role', async () => {
      const roleId = 'role-1';
      const updateData = { description: 'Updated description' };

      const updatedRole = {
        role_id: roleId,
        name: 'Admin',
        description: 'Updated description',
        permissions: { manage_users: true, manage_events: true },
        level_type: LevelType.REGULAR_CHAPTER_VOLUNTEER_LEVEL,
      };

      (prisma.roles.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await updateRole(roleId, updateData);

      expect(result).toEqual(updatedRole);
      expect(prisma.roles.update).toHaveBeenCalledWith({
        where: { role_id: roleId },
        data: updateData,
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete and return the role', async () => {
      const roleId = 'role-1';
      const deletedRole = {
        role_id: roleId,
        name: 'Obsolete',
        description: 'To be deleted',
        permissions: {},
        level_type: LevelType.REGULAR_CHAPTER_VOLUNTEER_LEVEL,
      };

      (prisma.roles.delete as jest.Mock).mockResolvedValue(deletedRole);

      const result = await deleteRole(roleId);

      expect(result).toEqual(deletedRole);
      expect(prisma.roles.delete).toHaveBeenCalledWith({
        where: { role_id: roleId },
      });
    });
  });
});
