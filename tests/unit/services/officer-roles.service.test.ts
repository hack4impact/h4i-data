import {
  getAllOfficerRoles,
  getOfficerRoleById,
  createOfficerRole,
  updateOfficerRole,
  deleteOfficerRole,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    officer_roles: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Officer Role Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOfficerRoles', () => {
    it('should return an array of officer roles', async () => {
      const mockRoles = [
        {
          role_id: '1',
          name: 'President',
          scope: 'CHAPTER',
          rank_level: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.officer_roles.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await getAllOfficerRoles();

      expect(result).toEqual(mockRoles);
      expect(prisma.officer_roles.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOfficerRoleById', () => {
    it('should return a single officer role when a valid ID is provided', async () => {
      const roleId = '1';
      const mockRole = {
        role_id: roleId,
        name: 'President',
        scope: 'CHAPTER',
        rank_level: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.officer_roles.findUnique as jest.Mock).mockResolvedValue(
        mockRole
      );

      const result = await getOfficerRoleById(roleId);

      expect(result).toEqual(mockRole);
      expect(prisma.officer_roles.findUnique).toHaveBeenCalledWith({
        where: { role_id: roleId },
      });
    });

    it('should throw NotFoundError if no officer role is found', async () => {
      const roleId = 'non-existent-id';
      (prisma.officer_roles.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getOfficerRoleById(roleId)).rejects.toThrow(
        "OfficerRole with id 'non-existent-id' not found"
      );
    });
  });

  describe('createOfficerRole', () => {
    it('should create and return a new officer role', async () => {
      const inputData = {
        name: 'Vice President',
        scope: 'CHAPTER' as const,
        rank_level: 2,
      };
      const createdRole = {
        role_id: 'new-id-123',
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.officer_roles.create as jest.Mock).mockResolvedValue(createdRole);

      const result = await createOfficerRole(inputData);

      expect(result).toEqual(createdRole);
      expect(prisma.officer_roles.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });
  });

  describe('updateOfficerRole', () => {
    it('should update and return the officer role', async () => {
      const roleId = '1';
      const updateData = { name: 'Updated President' };
      const updatedRole = {
        role_id: roleId,
        name: 'Updated President',
        scope: 'CHAPTER',
        rank_level: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.officer_roles.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await updateOfficerRole(roleId, updateData);

      expect(result).toEqual(updatedRole);
      expect(prisma.officer_roles.update).toHaveBeenCalledWith({
        where: { role_id: roleId },
        data: updateData,
      });
    });
  });

  describe('deleteOfficerRole', () => {
    it('should call delete with the correct ID and return the deleted officer role', async () => {
      const roleId = '1';
      const deletedRole = {
        role_id: roleId,
        name: 'President',
        scope: 'CHAPTER',
        rank_level: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.officer_roles.delete as jest.Mock).mockResolvedValue(deletedRole);

      const result = await deleteOfficerRole(roleId);

      expect(result).toEqual(deletedRole);
      expect(prisma.officer_roles.delete).toHaveBeenCalledWith({
        where: { role_id: roleId },
      });
    });
  });
});
