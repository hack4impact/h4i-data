import {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
      expect(prisma.universities.findMany).toHaveBeenCalledTimes(1);
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
  });
});
