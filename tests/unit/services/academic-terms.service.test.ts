import {
  getAllAcademicTerms,
  getAcademicTermById,
  createAcademicTerm,
  updateAcademicTerm,
  deleteAcademicTerm,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    academic_terms: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Academic Term Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAcademicTerms', () => {
    it('should return an array of academic terms', async () => {
      const mockTerms = [
        {
          term_id: '1',
          university_id: 'univ-1',
          name: 'Fall 2024',
          canonical_label: 'F24',
          type: 'SEMESTER',
          start_date: new Date('2024-08-26'),
          end_date: new Date('2024-12-15'),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.academic_terms.findMany as jest.Mock).mockResolvedValue(
        mockTerms
      );

      const result = await getAllAcademicTerms();

      expect(result).toEqual(mockTerms);
    });

    it('should return empty array when no academic terms exist', async () => {
      (prisma.academic_terms.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllAcademicTerms();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.academic_terms.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllAcademicTerms()).rejects.toThrow(
        'Failed to retrieve academic terms'
      );
    });
  });

  describe('getAcademicTermById', () => {
    it('should return a single academic term when a valid ID is provided', async () => {
      const termId = '1';
      const mockTerm = {
        term_id: termId,
        university_id: 'univ-1',
        name: 'Fall 2024',
        canonical_label: 'F24',
        type: 'SEMESTER',
        start_date: new Date('2024-08-26'),
        end_date: new Date('2024-12-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.academic_terms.findUnique as jest.Mock).mockResolvedValue(
        mockTerm
      );

      const result = await getAcademicTermById(termId);

      expect(result).toEqual(mockTerm);
    });

    it('should throw NotFoundError if no academic term is found', async () => {
      const termId = 'non-existent-id';
      (prisma.academic_terms.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getAcademicTermById(termId)).rejects.toThrow(
        "AcademicTerm with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.academic_terms.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAcademicTermById('1')).rejects.toThrow(
        'Failed to retrieve academic term'
      );
    });
  });

  describe('createAcademicTerm', () => {
    it('should create and return a new academic term', async () => {
      const inputData = {
        name: 'Spring 2025',
        canonical_label: 'S25',
        type: 'SEMESTER' as const,
        start_date: new Date('2025-01-13'),
        end_date: new Date('2025-05-10'),
      };
      const createdTerm = {
        term_id: 'new-id-123',
        university_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.academic_terms.create as jest.Mock).mockResolvedValue(
        createdTerm
      );

      const result = await createAcademicTerm(inputData);

      expect(result).toEqual(createdTerm);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.academic_terms.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createAcademicTerm({
          name: 'Spring 2025',
          canonical_label: 'S25',
          type: 'SEMESTER' as const,
          start_date: new Date(),
          end_date: new Date(),
        })
      ).rejects.toThrow('Failed to create academic term');
    });
  });

  describe('updateAcademicTerm', () => {
    it('should update and return the academic term', async () => {
      const termId = '1';
      const updateData = { name: 'Updated Fall 2024' };
      const updatedTerm = {
        term_id: termId,
        university_id: 'univ-1',
        name: 'Updated Fall 2024',
        canonical_label: 'F24',
        type: 'SEMESTER',
        start_date: new Date('2024-08-26'),
        end_date: new Date('2024-12-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.academic_terms.update as jest.Mock).mockResolvedValue(
        updatedTerm
      );

      const result = await updateAcademicTerm(termId, updateData);

      expect(result).toEqual(updatedTerm);
    });

    it('should throw NotFoundError when updating non-existent academic term', async () => {
      (prisma.academic_terms.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateAcademicTerm('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow("AcademicTerm with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.academic_terms.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateAcademicTerm('1', { name: 'Updated' })
      ).rejects.toThrow('Failed to update academic term');
    });
  });

  describe('deleteAcademicTerm', () => {
    it('should call delete with the correct ID and return the deleted academic term', async () => {
      const termId = '1';
      const deletedTerm = {
        term_id: termId,
        university_id: 'univ-1',
        name: 'Fall 2024',
        canonical_label: 'F24',
        type: 'SEMESTER',
        start_date: new Date('2024-08-26'),
        end_date: new Date('2024-12-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.academic_terms.delete as jest.Mock).mockResolvedValue(
        deletedTerm
      );

      const result = await deleteAcademicTerm(termId);

      expect(result).toEqual(deletedTerm);
    });

    it('should throw NotFoundError when deleting non-existent academic term', async () => {
      (prisma.academic_terms.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteAcademicTerm('non-existent-id')).rejects.toThrow(
        "AcademicTerm with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.academic_terms.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteAcademicTerm('1')).rejects.toThrow(
        'Failed to delete academic term'
      );
    });
  });
});
