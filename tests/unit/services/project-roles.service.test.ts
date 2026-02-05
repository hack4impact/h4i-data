import {
  getAllProjectRoles,
  getProjectRoleById,
  createProjectRole,
  updateProjectRole,
  deleteProjectRole,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
        },
      ];
      (prisma.project_roles.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await getAllProjectRoles();

      expect(result).toEqual(mockRoles);
      expect(prisma.project_roles.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProjectRoleById', () => {
    it('should return a single project role when a valid ID is provided', async () => {
      const roleId = '1';
      const mockRole = {
        role_id: roleId,
        name: 'Tech Lead',
        is_leadership: true,
      };
      (prisma.project_roles.findUnique as jest.Mock).mockResolvedValue(
        mockRole
      );

      const result = await getProjectRoleById(roleId);

      expect(result).toEqual(mockRole);
      expect(prisma.project_roles.findUnique).toHaveBeenCalledWith({
        where: { role_id: roleId },
      });
    });

    it('should throw NotFoundError if no project role is found', async () => {
      const roleId = 'non-existent-id';
      (prisma.project_roles.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProjectRoleById(roleId)).rejects.toThrow(
        "ProjectRole with id 'non-existent-id' not found"
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
        ...inputData,
      };
      (prisma.project_roles.create as jest.Mock).mockResolvedValue(createdRole);

      const result = await createProjectRole(inputData);

      expect(result).toEqual(createdRole);
      expect(prisma.project_roles.create).toHaveBeenCalledWith({
        data: inputData,
      });
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
      };
      (prisma.project_roles.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await updateProjectRole(roleId, updateData);

      expect(result).toEqual(updatedRole);
      expect(prisma.project_roles.update).toHaveBeenCalledWith({
        where: { role_id: roleId },
        data: updateData,
      });
    });
  });

  describe('deleteProjectRole', () => {
    it('should call delete with the correct ID and return the deleted project role', async () => {
      const roleId = '1';
      const deletedRole = {
        role_id: roleId,
        name: 'Tech Lead',
        is_leadership: true,
      };
      (prisma.project_roles.delete as jest.Mock).mockResolvedValue(deletedRole);

      const result = await deleteProjectRole(roleId);

      expect(result).toEqual(deletedRole);
      expect(prisma.project_roles.delete).toHaveBeenCalledWith({
        where: { role_id: roleId },
      });
    });
  });
});
