import {
  getAllMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    majors: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Major Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMajors', () => {
    it('should return an array of majors', async () => {
      const mockMajors = [
        {
          major_id: '1',
          name: 'Computer Science',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.majors.findMany as jest.Mock).mockResolvedValue(mockMajors);

      const result = await getAllMajors();

      expect(result).toEqual(mockMajors);
    });

    it('should return empty array when no majors exist', async () => {
      (prisma.majors.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllMajors();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.majors.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllMajors()).rejects.toThrow('Failed to retrieve majors');
    });
  });

  describe('getMajorById', () => {
    it('should return a single major when a valid ID is provided', async () => {
      const majorId = '1';
      const mockMajor = {
        major_id: majorId,
        name: 'Computer Science',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.majors.findUnique as jest.Mock).mockResolvedValue(mockMajor);

      const result = await getMajorById(majorId);

      expect(result).toEqual(mockMajor);
    });

    it('should throw NotFoundError if no major is found', async () => {
      const majorId = 'non-existent-id';
      (prisma.majors.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getMajorById(majorId)).rejects.toThrow(
        "Major with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.majors.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getMajorById('1')).rejects.toThrow(
        'Failed to retrieve major'
      );
    });
  });

  describe('createMajor', () => {
    it('should create and return a new major', async () => {
      const inputData = { name: 'Software Engineering' };
      const createdMajor = {
        major_id: 'new-id-123',
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.majors.create as jest.Mock).mockResolvedValue(createdMajor);

      const result = await createMajor(inputData);

      expect(result).toEqual(createdMajor);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.majors.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createMajor({ name: 'Software Engineering' })
      ).rejects.toThrow('Failed to create major');
    });
  });

  describe('updateMajor', () => {
    it('should update and return the major', async () => {
      const majorId = '1';
      const updateData = { name: 'Computer Engineering' };
      const updatedMajor = {
        major_id: majorId,
        name: 'Computer Engineering',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.majors.update as jest.Mock).mockResolvedValue(updatedMajor);

      const result = await updateMajor(majorId, updateData);

      expect(result).toEqual(updatedMajor);
    });

    it('should throw NotFoundError when updating non-existent major', async () => {
      (prisma.majors.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateMajor('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow("Major with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.majors.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(updateMajor('1', { name: 'Updated' })).rejects.toThrow(
        'Failed to update major'
      );
    });
  });

  describe('deleteMajor', () => {
    it('should call delete with the correct ID and return the deleted major', async () => {
      const majorId = '1';
      const deletedMajor = {
        major_id: majorId,
        name: 'Computer Science',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.majors.delete as jest.Mock).mockResolvedValue(deletedMajor);

      const result = await deleteMajor(majorId);

      expect(result).toEqual(deletedMajor);
    });

    it('should throw NotFoundError when deleting non-existent major', async () => {
      (prisma.majors.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteMajor('non-existent-id')).rejects.toThrow(
        "Major with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.majors.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteMajor('1')).rejects.toThrow('Failed to delete major');
    });
  });
});
