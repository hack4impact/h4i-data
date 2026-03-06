import {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    universities: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('University Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUniversities', () => {
    it('should return an array of universities', async () => {
      const mockUniversities = [
        {
          university_id: '1',
          name: 'Test University',
          email_domain: 'test.edu',
          location_id: 'loc-1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.universities.findMany as jest.Mock).mockResolvedValue(
        mockUniversities
      );

      const result = await getAllUniversities();

      expect(result).toEqual(mockUniversities);
      expect(prisma.universities.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no universities exist', async () => {
      (prisma.universities.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllUniversities();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.universities.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllUniversities()).rejects.toThrow(
        'Failed to retrieve universities'
      );
    });
  });

  describe('getUniversityById', () => {
    it('should return a single university when a valid ID is provided', async () => {
      const universityId = '1';
      const mockUniversity = {
        university_id: universityId,
        name: 'Test University',
        email_domain: 'test.edu',
        location_id: 'loc-1',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.universities.findUnique as jest.Mock).mockResolvedValue(
        mockUniversity
      );

      const result = await getUniversityById(universityId);

      expect(result).toEqual(mockUniversity);
      expect(prisma.universities.findUnique).toHaveBeenCalledWith({
        where: { university_id: universityId },
      });
    });

    it('should throw NotFoundError if no university is found', async () => {
      const universityId = 'non-existent-id';
      (prisma.universities.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getUniversityById(universityId)).rejects.toThrow(
        "University with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.universities.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getUniversityById('1')).rejects.toThrow(
        'Failed to retrieve university'
      );
    });
  });

  describe('createUniversity', () => {
    it('should create and return a new university', async () => {
      const inputData = {
        name: 'New University',
        email_domain: 'new.edu',
      };
      const createdUniversity = {
        university_id: 'new-id-123',
        ...inputData,
        location_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.universities.create as jest.Mock).mockResolvedValue(
        createdUniversity
      );

      const result = await createUniversity(inputData);

      expect(result).toEqual(createdUniversity);
      expect(prisma.universities.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.universities.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createUniversity({ name: 'New University', email_domain: 'new.edu' })
      ).rejects.toThrow('Failed to create university');
    });
  });

  describe('updateUniversity', () => {
    it('should update and return the university', async () => {
      const universityId = '1';
      const updateData = { name: 'Updated University' };
      const updatedUniversity = {
        university_id: universityId,
        name: 'Updated University',
        email_domain: 'test.edu',
        location_id: 'loc-1',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.universities.update as jest.Mock).mockResolvedValue(
        updatedUniversity
      );

      const result = await updateUniversity(universityId, updateData);

      expect(result).toEqual(updatedUniversity);
      expect(prisma.universities.update).toHaveBeenCalledWith({
        where: { university_id: universityId },
        data: updateData,
      });
    });

    it('should throw NotFoundError when updating non-existent university', async () => {
      (prisma.universities.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateUniversity('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow("University with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.universities.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(updateUniversity('1', { name: 'Updated' })).rejects.toThrow(
        'Failed to update university'
      );
    });
  });

  describe('deleteUniversity', () => {
    it('should call delete with the correct ID and return the deleted university', async () => {
      const universityId = '1';
      const deletedUniversity = {
        university_id: universityId,
        name: 'Test University',
        email_domain: 'test.edu',
        location_id: 'loc-1',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.universities.delete as jest.Mock).mockResolvedValue(
        deletedUniversity
      );

      const result = await deleteUniversity(universityId);

      expect(result).toEqual(deletedUniversity);
      expect(prisma.universities.delete).toHaveBeenCalledWith({
        where: { university_id: universityId },
      });
    });

    it('should throw NotFoundError when deleting non-existent university', async () => {
      (prisma.universities.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteUniversity('non-existent-id')).rejects.toThrow(
        "University with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.universities.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteUniversity('1')).rejects.toThrow(
        'Failed to delete university'
      );
    });
  });
});
