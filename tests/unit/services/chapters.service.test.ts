import {
  getAllChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    chapters: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Chapter Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllChapters', () => {
    it('should return an array of chapters', async () => {
      const mockChapters = [
        {
          chapter_id: '1',
          name: 'Test Chapter 1',
          university_id: 'univ-1',
          location_id: null,
          founded_date: new Date('2025-01-15'),
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.chapters.findMany as jest.Mock).mockResolvedValue(mockChapters);

      const result = await getAllChapters();

      expect(result).toEqual(mockChapters);
      expect(prisma.chapters.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getChapterById', () => {
    it('should return a single chapter when a valid ID is provided', async () => {
      const chapterId = '1';
      const mockChapter = {
        chapter_id: chapterId,
        name: 'Test Chapter 1',
        university_id: 'univ-1',
        location_id: null,
        founded_date: new Date('2025-01-15'),
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.findUnique as jest.Mock).mockResolvedValue(mockChapter);

      const result = await getChapterById(chapterId);

      expect(result).toEqual(mockChapter);
      expect(prisma.chapters.findUnique).toHaveBeenCalledWith({
        where: { chapter_id: chapterId },
      });
    });

    it('should throw NotFoundError if no chapter is found', async () => {
      const chapterId = 'non-existent-id';
      (prisma.chapters.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getChapterById(chapterId)).rejects.toThrow(
        "Chapter with id 'non-existent-id' not found"
      );
    });
  });

  describe('createChapter', () => {
    it('should create and return a new chapter', async () => {
      const inputData = {
        name: 'New Chapter',
        university_id: 'univ-1',
        founded_date: new Date('2025-08-30'),
      };
      const createdChapter = {
        chapter_id: 'new-id-123',
        name: 'New Chapter',
        university_id: 'univ-1',
        location_id: null,
        founded_date: new Date('2025-08-30'),
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.create as jest.Mock).mockResolvedValue(createdChapter);

      const result = await createChapter(inputData);

      expect(result).toEqual(createdChapter);
      expect(prisma.chapters.create).toHaveBeenCalledWith({ data: inputData });
    });
  });

  describe('updateChapter', () => {
    it('should update and return the chapter', async () => {
      const chapterId = '1';
      const updateData = { name: 'Updated Chapter Name' };
      const updatedChapter = {
        chapter_id: chapterId,
        name: 'Updated Chapter Name',
        university_id: 'univ-1',
        location_id: null,
        founded_date: new Date('2025-01-15'),
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.update as jest.Mock).mockResolvedValue(updatedChapter);

      const result = await updateChapter(chapterId, updateData);

      expect(result).toEqual(updatedChapter);
      expect(prisma.chapters.update).toHaveBeenCalledWith({
        where: { chapter_id: chapterId },
        data: updateData,
      });
    });
  });

  describe('deleteChapter', () => {
    it('should call delete with the correct ID and return the deleted chapter', async () => {
      const chapterId = '1';
      const deletedChapter = {
        chapter_id: chapterId,
        name: 'Deleted Chapter',
        university_id: 'univ-1',
        location_id: null,
        founded_date: new Date('2025-01-15'),
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.delete as jest.Mock).mockResolvedValue(deletedChapter);

      const result = await deleteChapter(chapterId);

      expect(result).toEqual(deletedChapter);
      expect(prisma.chapters.delete).toHaveBeenCalledWith({
        where: { chapter_id: chapterId },
      });
    });
  });
});
