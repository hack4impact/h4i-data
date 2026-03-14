import {
  getAllProjectDeliverables,
  getProjectDeliverableById,
  createProjectDeliverable,
  updateProjectDeliverable,
  deleteProjectDeliverable,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    project_resources: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Project Deliverable Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjectDeliverables', () => {
    it('should return an array of project deliverables', async () => {
      const mockDeliverables = [
        {
          project_resource_id: '1',
          project_id: 'proj-1',
          label: 'Main Repository',
          url: 'https://github.com/org/repo',
          category: 'CODE',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.project_resources.findMany as jest.Mock).mockResolvedValue(
        mockDeliverables
      );

      const result = await getAllProjectDeliverables();

      expect(result).toEqual(mockDeliverables);
    });

    it('should return empty array when no project deliverables exist', async () => {
      (prisma.project_resources.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllProjectDeliverables();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.project_resources.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllProjectDeliverables()).rejects.toThrow(
        'Failed to retrieve project deliverables'
      );
    });
  });

  describe('getProjectDeliverableById', () => {
    it('should return a single project deliverable when a valid ID is provided', async () => {
      const deliverableId = '1';
      const mockDeliverable = {
        project_resource_id: deliverableId,
        project_id: 'proj-1',
        label: 'Main Repository',
        url: 'https://github.com/org/repo',
        category: 'CODE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_resources.findUnique as jest.Mock).mockResolvedValue(
        mockDeliverable
      );

      const result = await getProjectDeliverableById(deliverableId);

      expect(result).toEqual(mockDeliverable);
    });

    it('should throw NotFoundError if no project deliverable is found', async () => {
      const deliverableId = 'non-existent-id';
      (prisma.project_resources.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(getProjectDeliverableById(deliverableId)).rejects.toThrow(
        "ProjectDeliverable with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.project_resources.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getProjectDeliverableById('1')).rejects.toThrow(
        'Failed to retrieve project deliverable'
      );
    });
  });

  describe('createProjectDeliverable', () => {
    it('should create and return a new project deliverable', async () => {
      const inputData = {
        project_id: 'proj-1',
        label: 'Design Spec',
        url: 'https://figma.com/file/123',
        category: 'DESIGNS' as const,
      };
      const createdDeliverable = {
        project_resource_id: 'new-id-123',
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.project_resources.create as jest.Mock).mockResolvedValue(
        createdDeliverable
      );

      const result = await createProjectDeliverable(inputData);

      expect(result).toEqual(createdDeliverable);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.project_resources.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createProjectDeliverable({
          project_id: 'proj-1',
          label: 'Spec',
          url: 'https://example.com',
          category: 'DESIGNS' as const,
        })
      ).rejects.toThrow('Failed to create project deliverable');
    });
  });

  describe('updateProjectDeliverable', () => {
    it('should update and return the project deliverable', async () => {
      const deliverableId = '1';
      const updateData = { label: 'Updated Repository' };
      const updatedDeliverable = {
        project_resource_id: deliverableId,
        project_id: 'proj-1',
        label: 'Updated Repository',
        url: 'https://github.com/org/repo',
        category: 'CODE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_resources.update as jest.Mock).mockResolvedValue(
        updatedDeliverable
      );

      const result = await updateProjectDeliverable(deliverableId, updateData);

      expect(result).toEqual(updatedDeliverable);
    });

    it('should throw NotFoundError when updating non-existent project deliverable', async () => {
      (prisma.project_resources.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateProjectDeliverable('non-existent-id', { label: 'Updated' })
      ).rejects.toThrow(
        "ProjectDeliverable with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.project_resources.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateProjectDeliverable('1', { label: 'Updated' })
      ).rejects.toThrow('Failed to update project deliverable');
    });
  });

  describe('deleteProjectDeliverable', () => {
    it('should call delete with the correct ID and return the deleted deliverable', async () => {
      const deliverableId = '1';
      const deletedDeliverable = {
        project_resource_id: deliverableId,
        project_id: 'proj-1',
        label: 'Main Repository',
        url: 'https://github.com/org/repo',
        category: 'CODE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_resources.delete as jest.Mock).mockResolvedValue(
        deletedDeliverable
      );

      const result = await deleteProjectDeliverable(deliverableId);

      expect(result).toEqual(deletedDeliverable);
    });

    it('should throw NotFoundError when deleting non-existent project deliverable', async () => {
      (prisma.project_resources.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteProjectDeliverable('non-existent-id')).rejects.toThrow(
        "ProjectDeliverable with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.project_resources.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteProjectDeliverable('1')).rejects.toThrow(
        'Failed to delete project deliverable'
      );
    });
  });
});
