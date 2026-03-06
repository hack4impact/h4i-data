import {
  getAllProjectStaffing,
  getProjectStaffingById,
  createProjectStaffing,
  updateProjectStaffing,
  deleteProjectStaffing,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    project_staffing: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Project Staffing Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjectStaffing', () => {
    it('should return an array of project staffing records', async () => {
      const mockStaffing = [
        {
          staffing_id: '1',
          volunteer_id: 'vol-1',
          engagement_id: 'eng-1',
          role_id: 'role-1',
          is_lead_contact: true,
          start_date: new Date('2024-01-15'),
          end_date: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.project_staffing.findMany as jest.Mock).mockResolvedValue(
        mockStaffing
      );

      const result = await getAllProjectStaffing();

      expect(result).toEqual(mockStaffing);
    });

    it('should return empty array when no project staffing records exist', async () => {
      (prisma.project_staffing.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllProjectStaffing();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.project_staffing.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllProjectStaffing()).rejects.toThrow(
        'Failed to retrieve project staffing'
      );
    });
  });

  describe('getProjectStaffingById', () => {
    it('should return a single project staffing record when a valid ID is provided', async () => {
      const staffingId = '1';
      const mockStaffing = {
        staffing_id: staffingId,
        volunteer_id: 'vol-1',
        engagement_id: 'eng-1',
        role_id: 'role-1',
        is_lead_contact: true,
        start_date: new Date('2024-01-15'),
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_staffing.findUnique as jest.Mock).mockResolvedValue(
        mockStaffing
      );

      const result = await getProjectStaffingById(staffingId);

      expect(result).toEqual(mockStaffing);
    });

    it('should throw NotFoundError if no project staffing is found', async () => {
      const staffingId = 'non-existent-id';
      (prisma.project_staffing.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProjectStaffingById(staffingId)).rejects.toThrow(
        "ProjectStaffing with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.project_staffing.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getProjectStaffingById('1')).rejects.toThrow(
        'Failed to retrieve project staffing'
      );
    });
  });

  describe('createProjectStaffing', () => {
    it('should create and return a new project staffing record', async () => {
      const inputData = {
        volunteer_id: 'vol-1',
        engagement_id: 'eng-1',
        role_id: 'role-1',
        is_lead_contact: false,
        start_date: new Date('2024-02-01'),
      };
      const createdStaffing = {
        staffing_id: 'new-id-123',
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.project_staffing.create as jest.Mock).mockResolvedValue(
        createdStaffing
      );

      const result = await createProjectStaffing(inputData);

      expect(result).toEqual(createdStaffing);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.project_staffing.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createProjectStaffing({
          volunteer_id: 'vol-1',
          engagement_id: 'eng-1',
          role_id: 'role-1',
          is_lead_contact: false,
          start_date: new Date(),
        })
      ).rejects.toThrow('Failed to create project staffing');
    });
  });

  describe('updateProjectStaffing', () => {
    it('should update and return the project staffing record', async () => {
      const staffingId = '1';
      const updateData = { is_lead_contact: false };
      const updatedStaffing = {
        staffing_id: staffingId,
        volunteer_id: 'vol-1',
        engagement_id: 'eng-1',
        role_id: 'role-1',
        is_lead_contact: false,
        start_date: new Date('2024-01-15'),
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_staffing.update as jest.Mock).mockResolvedValue(
        updatedStaffing
      );

      const result = await updateProjectStaffing(staffingId, updateData);

      expect(result).toEqual(updatedStaffing);
    });

    it('should throw NotFoundError when updating non-existent project staffing', async () => {
      (prisma.project_staffing.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateProjectStaffing('non-existent-id', { is_lead_contact: false })
      ).rejects.toThrow("ProjectStaffing with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.project_staffing.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateProjectStaffing('1', { is_lead_contact: false })
      ).rejects.toThrow('Failed to update project staffing');
    });
  });

  describe('deleteProjectStaffing', () => {
    it('should call delete with the correct ID and return the deleted record', async () => {
      const staffingId = '1';
      const deletedStaffing = {
        staffing_id: staffingId,
        volunteer_id: 'vol-1',
        engagement_id: 'eng-1',
        role_id: 'role-1',
        is_lead_contact: true,
        start_date: new Date('2024-01-15'),
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_staffing.delete as jest.Mock).mockResolvedValue(
        deletedStaffing
      );

      const result = await deleteProjectStaffing(staffingId);

      expect(result).toEqual(deletedStaffing);
    });

    it('should throw NotFoundError when deleting non-existent project staffing', async () => {
      (prisma.project_staffing.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteProjectStaffing('non-existent-id')).rejects.toThrow(
        "ProjectStaffing with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.project_staffing.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteProjectStaffing('1')).rejects.toThrow(
        'Failed to delete project staffing'
      );
    });
  });
});
