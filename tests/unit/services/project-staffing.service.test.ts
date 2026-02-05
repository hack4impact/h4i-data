import {
  getAllProjectStaffing,
  getProjectStaffingById,
  createProjectStaffing,
  updateProjectStaffing,
  deleteProjectStaffing,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
        },
      ];
      (prisma.project_staffing.findMany as jest.Mock).mockResolvedValue(
        mockStaffing
      );

      const result = await getAllProjectStaffing();

      expect(result).toEqual(mockStaffing);
      expect(prisma.project_staffing.findMany).toHaveBeenCalledTimes(1);
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
      };
      (prisma.project_staffing.findUnique as jest.Mock).mockResolvedValue(
        mockStaffing
      );

      const result = await getProjectStaffingById(staffingId);

      expect(result).toEqual(mockStaffing);
      expect(prisma.project_staffing.findUnique).toHaveBeenCalledWith({
        where: { staffing_id: staffingId },
      });
    });

    it('should throw NotFoundError if no project staffing is found', async () => {
      const staffingId = 'non-existent-id';
      (prisma.project_staffing.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProjectStaffingById(staffingId)).rejects.toThrow(
        "ProjectStaffing with id 'non-existent-id' not found"
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
        ...inputData,
      };
      (prisma.project_staffing.create as jest.Mock).mockResolvedValue(
        createdStaffing
      );

      const result = await createProjectStaffing(inputData);

      expect(result).toEqual(createdStaffing);
      expect(prisma.project_staffing.create).toHaveBeenCalledWith({
        data: inputData,
      });
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
      };
      (prisma.project_staffing.update as jest.Mock).mockResolvedValue(
        updatedStaffing
      );

      const result = await updateProjectStaffing(staffingId, updateData);

      expect(result).toEqual(updatedStaffing);
      expect(prisma.project_staffing.update).toHaveBeenCalledWith({
        where: { staffing_id: staffingId },
        data: updateData,
      });
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
      };
      (prisma.project_staffing.delete as jest.Mock).mockResolvedValue(
        deletedStaffing
      );

      const result = await deleteProjectStaffing(staffingId);

      expect(result).toEqual(deletedStaffing);
      expect(prisma.project_staffing.delete).toHaveBeenCalledWith({
        where: { staffing_id: staffingId },
      });
    });
  });
});
