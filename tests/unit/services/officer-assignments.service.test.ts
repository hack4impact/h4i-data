import {
  getAllOfficerAssignments,
  getOfficerAssignmentById,
  createOfficerAssignment,
  updateOfficerAssignment,
  deleteOfficerAssignment,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    officer_assignments: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Officer Assignment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOfficerAssignments', () => {
    it('should return an array of officer assignments', async () => {
      const mockAssignments = [
        {
          assignment_id: '1',
          volunteer_id: 'vol-1',
          role_id: 'role-1',
          chapter_id: 'chapter-1',
          start_date: new Date('2024-01-15'),
          end_date: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.officer_assignments.findMany as jest.Mock).mockResolvedValue(
        mockAssignments
      );

      const result = await getAllOfficerAssignments();

      expect(result).toEqual(mockAssignments);
    });

    it('should return empty array when no officer assignments exist', async () => {
      (prisma.officer_assignments.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllOfficerAssignments();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.officer_assignments.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllOfficerAssignments()).rejects.toThrow(
        'Failed to retrieve officer assignments'
      );
    });
  });

  describe('getOfficerAssignmentById', () => {
    it('should return a single officer assignment when a valid ID is provided', async () => {
      const assignmentId = '1';
      const mockAssignment = {
        assignment_id: assignmentId,
        volunteer_id: 'vol-1',
        role_id: 'role-1',
        chapter_id: 'chapter-1',
        start_date: new Date('2024-01-15'),
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.officer_assignments.findUnique as jest.Mock).mockResolvedValue(
        mockAssignment
      );

      const result = await getOfficerAssignmentById(assignmentId);

      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundError if no officer assignment is found', async () => {
      const assignmentId = 'non-existent-id';
      (prisma.officer_assignments.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(getOfficerAssignmentById(assignmentId)).rejects.toThrow(
        "OfficerAssignment with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.officer_assignments.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getOfficerAssignmentById('1')).rejects.toThrow(
        'Failed to retrieve officer assignment'
      );
    });
  });

  describe('createOfficerAssignment', () => {
    it('should create and return a new officer assignment', async () => {
      const inputData = {
        volunteer_id: 'vol-1',
        role_id: 'role-1',
        chapter_id: 'chapter-1',
        start_date: new Date('2024-01-15'),
      };
      const createdAssignment = {
        assignment_id: 'new-id-123',
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.officer_assignments.create as jest.Mock).mockResolvedValue(
        createdAssignment
      );

      const result = await createOfficerAssignment(inputData);

      expect(result).toEqual(createdAssignment);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.officer_assignments.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createOfficerAssignment({
          volunteer_id: 'vol-1',
          role_id: 'role-1',
          chapter_id: 'chapter-1',
          start_date: new Date(),
        })
      ).rejects.toThrow('Failed to create officer assignment');
    });
  });

  describe('updateOfficerAssignment', () => {
    it('should update and return the officer assignment', async () => {
      const assignmentId = '1';
      const updateData = { end_date: new Date('2024-12-31') };
      const updatedAssignment = {
        assignment_id: assignmentId,
        volunteer_id: 'vol-1',
        role_id: 'role-1',
        chapter_id: 'chapter-1',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-12-31'),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.officer_assignments.update as jest.Mock).mockResolvedValue(
        updatedAssignment
      );

      const result = await updateOfficerAssignment(assignmentId, updateData);

      expect(result).toEqual(updatedAssignment);
    });

    it('should throw NotFoundError when updating non-existent officer assignment', async () => {
      (prisma.officer_assignments.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateOfficerAssignment('non-existent-id', { end_date: new Date() })
      ).rejects.toThrow(
        "OfficerAssignment with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.officer_assignments.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateOfficerAssignment('1', { end_date: new Date() })
      ).rejects.toThrow('Failed to update officer assignment');
    });
  });

  describe('deleteOfficerAssignment', () => {
    it('should call delete with the correct ID and return the deleted assignment', async () => {
      const assignmentId = '1';
      const deletedAssignment = {
        assignment_id: assignmentId,
        volunteer_id: 'vol-1',
        role_id: 'role-1',
        chapter_id: 'chapter-1',
        start_date: new Date('2024-01-15'),
        end_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.officer_assignments.delete as jest.Mock).mockResolvedValue(
        deletedAssignment
      );

      const result = await deleteOfficerAssignment(assignmentId);

      expect(result).toEqual(deletedAssignment);
    });

    it('should throw NotFoundError when deleting non-existent officer assignment', async () => {
      (prisma.officer_assignments.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteOfficerAssignment('non-existent-id')).rejects.toThrow(
        "OfficerAssignment with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.officer_assignments.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteOfficerAssignment('1')).rejects.toThrow(
        'Failed to delete officer assignment'
      );
    });
  });
});
