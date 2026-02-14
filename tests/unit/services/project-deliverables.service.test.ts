import {
  getAllProjectDeliverables,
  getProjectDeliverableById,
  createProjectDeliverable,
  updateProjectDeliverable,
  deleteProjectDeliverable,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    project_deliverables: {
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
          deliverable_id: '1',
          project_id: 'proj-1',
          label: 'Main Repository',
          url: 'https://github.com/org/repo',
          category: 'REPO',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.project_deliverables.findMany as jest.Mock).mockResolvedValue(
        mockDeliverables
      );

      const result = await getAllProjectDeliverables();

      expect(result).toEqual(mockDeliverables);
      expect(prisma.project_deliverables.findMany).toHaveBeenCalledWith({
        orderBy: { deliverable_id: 'asc' },
      });
    });

    it('should return empty array when no project deliverables exist', async () => {
      (prisma.project_deliverables.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllProjectDeliverables();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.project_deliverables.findMany as jest.Mock).mockRejectedValue(
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
        deliverable_id: deliverableId,
        project_id: 'proj-1',
        label: 'Main Repository',
        url: 'https://github.com/org/repo',
        category: 'REPO',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_deliverables.findUnique as jest.Mock).mockResolvedValue(
        mockDeliverable
      );

      const result = await getProjectDeliverableById(deliverableId);

      expect(result).toEqual(mockDeliverable);
      expect(prisma.project_deliverables.findUnique).toHaveBeenCalledWith({
        where: { deliverable_id: deliverableId },
      });
    });

    it('should throw NotFoundError if no project deliverable is found', async () => {
      const deliverableId = 'non-existent-id';
      (prisma.project_deliverables.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(getProjectDeliverableById(deliverableId)).rejects.toThrow(
        "ProjectDeliverable with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.project_deliverables.findUnique as jest.Mock).mockRejectedValue(
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
        category: 'DESIGN_SPEC' as const,
      };
      const createdDeliverable = {
        deliverable_id: 'new-id-123',
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.project_deliverables.create as jest.Mock).mockResolvedValue(
        createdDeliverable
      );

      const result = await createProjectDeliverable(inputData);

      expect(result).toEqual(createdDeliverable);
      expect(prisma.project_deliverables.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.project_deliverables.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createProjectDeliverable({
          project_id: 'proj-1',
          label: 'Spec',
          url: 'https://example.com',
          category: 'DESIGN_SPEC' as const,
        })
      ).rejects.toThrow('Failed to create project deliverable');
    });
  });

  describe('updateProjectDeliverable', () => {
    it('should update and return the project deliverable', async () => {
      const deliverableId = '1';
      const updateData = { label: 'Updated Repository' };
      const updatedDeliverable = {
        deliverable_id: deliverableId,
        project_id: 'proj-1',
        label: 'Updated Repository',
        url: 'https://github.com/org/repo',
        category: 'REPO',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_deliverables.update as jest.Mock).mockResolvedValue(
        updatedDeliverable
      );

      const result = await updateProjectDeliverable(deliverableId, updateData);

      expect(result).toEqual(updatedDeliverable);
      expect(prisma.project_deliverables.update).toHaveBeenCalledWith({
        where: { deliverable_id: deliverableId },
        data: updateData,
      });
    });

    it('should throw NotFoundError when updating non-existent project deliverable', async () => {
      (prisma.project_deliverables.update as jest.Mock).mockRejectedValue(
        new Error('Record to update not found')
      );
      await expect(
        updateProjectDeliverable('non-existent-id', { label: 'Updated' })
      ).rejects.toThrow(
        "ProjectDeliverable with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.project_deliverables.update as jest.Mock).mockRejectedValue(
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
        deliverable_id: deliverableId,
        project_id: 'proj-1',
        label: 'Main Repository',
        url: 'https://github.com/org/repo',
        category: 'REPO',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_deliverables.delete as jest.Mock).mockResolvedValue(
        deletedDeliverable
      );

      const result = await deleteProjectDeliverable(deliverableId);

      expect(result).toEqual(deletedDeliverable);
      expect(prisma.project_deliverables.delete).toHaveBeenCalledWith({
        where: { deliverable_id: deliverableId },
      });
    });

    it('should throw NotFoundError when deleting non-existent project deliverable', async () => {
      (prisma.project_deliverables.delete as jest.Mock).mockRejectedValue(
        new Error('Record to delete does not exist')
      );
      await expect(deleteProjectDeliverable('non-existent-id')).rejects.toThrow(
        "ProjectDeliverable with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.project_deliverables.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteProjectDeliverable('1')).rejects.toThrow(
        'Failed to delete project deliverable'
      );
    });
  });
});
