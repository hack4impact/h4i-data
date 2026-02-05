import {
  getAllAcademicTerms,
  getAcademicTermById,
  createAcademicTerm,
  updateAcademicTerm,
  deleteAcademicTerm,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
        },
      ];
      (prisma.academic_terms.findMany as jest.Mock).mockResolvedValue(
        mockTerms
      );

      const result = await getAllAcademicTerms();

      expect(result).toEqual(mockTerms);
      expect(prisma.academic_terms.findMany).toHaveBeenCalledTimes(1);
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
      };
      (prisma.academic_terms.findUnique as jest.Mock).mockResolvedValue(
        mockTerm
      );

      const result = await getAcademicTermById(termId);

      expect(result).toEqual(mockTerm);
      expect(prisma.academic_terms.findUnique).toHaveBeenCalledWith({
        where: { term_id: termId },
      });
    });

    it('should throw NotFoundError if no academic term is found', async () => {
      const termId = 'non-existent-id';
      (prisma.academic_terms.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getAcademicTermById(termId)).rejects.toThrow(
        "AcademicTerm with id 'non-existent-id' not found"
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
        ...inputData,
      };
      (prisma.academic_terms.create as jest.Mock).mockResolvedValue(
        createdTerm
      );

      const result = await createAcademicTerm(inputData);

      expect(result).toEqual(createdTerm);
      expect(prisma.academic_terms.create).toHaveBeenCalledWith({
        data: inputData,
      });
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
      };
      (prisma.academic_terms.update as jest.Mock).mockResolvedValue(
        updatedTerm
      );

      const result = await updateAcademicTerm(termId, updateData);

      expect(result).toEqual(updatedTerm);
      expect(prisma.academic_terms.update).toHaveBeenCalledWith({
        where: { term_id: termId },
        data: updateData,
      });
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
      };
      (prisma.academic_terms.delete as jest.Mock).mockResolvedValue(
        deletedTerm
      );

      const result = await deleteAcademicTerm(termId);

      expect(result).toEqual(deletedTerm);
      expect(prisma.academic_terms.delete).toHaveBeenCalledWith({
        where: { term_id: termId },
      });
    });
  });
});
