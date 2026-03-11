import {
  getAllVolunteerHistory,
  getVolunteerHistoryById,
  createVolunteerHistory,
  updateVolunteerHistory,
  deleteVolunteerHistory,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    volunteer_history: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Volunteer History Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVolunteerHistory', () => {
    it('should return an array of volunteer history records', async () => {
      const mockHistory = [
        {
          volunteer_history_id: '1',
          volunteer_id: 'vol-1',
          action_type: 'ENROLLED',
          related_entity_id: 'chapter-1',
          related_entity_type: null,
          previous_value_label: null,
          new_value_label: 'Chapter A',
          effective_date: new Date('2024-01-15'),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.volunteer_history.findMany as jest.Mock).mockResolvedValue(
        mockHistory
      );

      const result = await getAllVolunteerHistory();

      expect(result).toEqual(mockHistory);
    });

    it('should return empty array when no volunteer history records exist', async () => {
      (prisma.volunteer_history.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllVolunteerHistory();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.volunteer_history.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllVolunteerHistory()).rejects.toThrow(
        'Failed to retrieve volunteer history'
      );
    });
  });

  describe('getVolunteerHistoryById', () => {
    it('should return a single volunteer history record when a valid ID is provided', async () => {
      const historyId = '1';
      const mockHistory = {
        volunteer_history_id: historyId,
        volunteer_id: 'vol-1',
        action_type: 'ENROLLED',
        related_entity_id: 'chapter-1',
        related_entity_type: null,
        previous_value_label: null,
        new_value_label: 'Chapter A',
        effective_date: new Date('2024-01-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteer_history.findUnique as jest.Mock).mockResolvedValue(
        mockHistory
      );

      const result = await getVolunteerHistoryById(historyId);

      expect(result).toEqual(mockHistory);
    });

    it('should throw NotFoundError if no volunteer history is found', async () => {
      const historyId = 'non-existent-id';
      (prisma.volunteer_history.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(getVolunteerHistoryById(historyId)).rejects.toThrow(
        "VolunteerHistory with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.volunteer_history.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getVolunteerHistoryById('1')).rejects.toThrow(
        'Failed to retrieve volunteer history'
      );
    });
  });

  describe('createVolunteerHistory', () => {
    it('should create and return a new volunteer history record', async () => {
      const inputData = {
        volunteer_id: 'vol-1',
        action_type: 'PROMOTED' as const,
        new_value_label: 'Senior Member',
        effective_date: new Date('2024-06-01'),
      };
      const createdHistory = {
        volunteer_history_id: 'new-id-123',
        related_entity_id: null,
        related_entity_type: null,
        previous_value_label: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.volunteer_history.create as jest.Mock).mockResolvedValue(
        createdHistory
      );

      const result = await createVolunteerHistory(inputData);

      expect(result).toEqual(createdHistory);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.volunteer_history.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createVolunteerHistory({
          volunteer_id: 'vol-1',
          action_type: 'PROMOTED' as const,
          new_value_label: 'Senior',
          effective_date: new Date(),
        })
      ).rejects.toThrow('Failed to create volunteer history');
    });
  });

  describe('updateVolunteerHistory', () => {
    it('should update and return the volunteer history record', async () => {
      const historyId = '1';
      const updateData = { new_value_label: 'Updated Label' };
      const updatedHistory = {
        volunteer_history_id: historyId,
        volunteer_id: 'vol-1',
        action_type: 'ENROLLED',
        related_entity_id: 'chapter-1',
        related_entity_type: null,
        previous_value_label: null,
        new_value_label: 'Updated Label',
        effective_date: new Date('2024-01-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteer_history.update as jest.Mock).mockResolvedValue(
        updatedHistory
      );

      const result = await updateVolunteerHistory(historyId, updateData);

      expect(result).toEqual(updatedHistory);
    });

    it('should throw NotFoundError when updating non-existent volunteer history', async () => {
      (prisma.volunteer_history.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateVolunteerHistory('non-existent-id', {
          new_value_label: 'Updated',
        })
      ).rejects.toThrow("VolunteerHistory with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.volunteer_history.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateVolunteerHistory('1', { new_value_label: 'Updated' })
      ).rejects.toThrow('Failed to update volunteer history');
    });
  });

  describe('deleteVolunteerHistory', () => {
    it('should call delete with the correct ID and return the deleted record', async () => {
      const historyId = '1';
      const deletedHistory = {
        volunteer_history_id: historyId,
        volunteer_id: 'vol-1',
        action_type: 'ENROLLED',
        related_entity_id: 'chapter-1',
        related_entity_type: null,
        previous_value_label: null,
        new_value_label: 'Chapter A',
        effective_date: new Date('2024-01-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteer_history.delete as jest.Mock).mockResolvedValue(
        deletedHistory
      );

      const result = await deleteVolunteerHistory(historyId);

      expect(result).toEqual(deletedHistory);
    });

    it('should throw NotFoundError when deleting non-existent volunteer history', async () => {
      (prisma.volunteer_history.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteVolunteerHistory('non-existent-id')).rejects.toThrow(
        "VolunteerHistory with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.volunteer_history.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteVolunteerHistory('1')).rejects.toThrow(
        'Failed to delete volunteer history'
      );
    });
  });
});
