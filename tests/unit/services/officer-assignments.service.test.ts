import {
  getAllOfficerAssignments,
  getOfficerAssignmentById,
  createOfficerAssignment,
  updateOfficerAssignment,
  deleteOfficerAssignment,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
        },
      ];
      (prisma.officer_assignments.findMany as jest.Mock).mockResolvedValue(
        mockAssignments
      );

      const result = await getAllOfficerAssignments();

      expect(result).toEqual(mockAssignments);
      expect(prisma.officer_assignments.findMany).toHaveBeenCalledTimes(1);
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
      };
      (prisma.officer_assignments.findUnique as jest.Mock).mockResolvedValue(
        mockAssignment
      );

      const result = await getOfficerAssignmentById(assignmentId);

      expect(result).toEqual(mockAssignment);
      expect(prisma.officer_assignments.findUnique).toHaveBeenCalledWith({
        where: { assignment_id: assignmentId },
      });
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
        ...inputData,
      };
      (prisma.officer_assignments.create as jest.Mock).mockResolvedValue(
        createdAssignment
      );

      const result = await createOfficerAssignment(inputData);

      expect(result).toEqual(createdAssignment);
      expect(prisma.officer_assignments.create).toHaveBeenCalledWith({
        data: inputData,
      });
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
      };
      (prisma.officer_assignments.update as jest.Mock).mockResolvedValue(
        updatedAssignment
      );

      const result = await updateOfficerAssignment(assignmentId, updateData);

      expect(result).toEqual(updatedAssignment);
      expect(prisma.officer_assignments.update).toHaveBeenCalledWith({
        where: { assignment_id: assignmentId },
        data: updateData,
      });
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
      };
      (prisma.officer_assignments.delete as jest.Mock).mockResolvedValue(
        deletedAssignment
      );

      const result = await deleteOfficerAssignment(assignmentId);

      expect(result).toEqual(deletedAssignment);
      expect(prisma.officer_assignments.delete).toHaveBeenCalledWith({
        where: { assignment_id: assignmentId },
      });
    });
  });
});
