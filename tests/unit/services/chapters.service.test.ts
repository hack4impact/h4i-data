import {
  getAllChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

// We mock the entire prisma module. This replaces the actual prisma client
// with a mock object that we can control in our tests.
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
  // Before each test, clear all previous mock calls and return values
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllChapters', () => {
    it('should return an array of chapters', async () => {
      // Arrange: Define the data our mock Prisma should return
      const mockChapters = [
        {
          chapter_id: '1',
          name: 'Test Chapter 1',
          founded_date: new Date('2025-01-15'),
          status_type: 'ACTIVE',
          location_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      // Cast the mocked function to jest.Mock
      (prisma.chapters.findMany as jest.Mock).mockResolvedValue(mockChapters);

      // Act: Call the service function
      const result = await getAllChapters();

      // Assert: Check if the result matches our mock data
      expect(result).toEqual(mockChapters);
      expect(prisma.chapters.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getChapterById', () => {
    it('should return a single chapter when a valid ID is provided', async () => {
      // Arrange
      const chapterId = '1';
      const mockChapter = {
        chapter_id: chapterId,
        name: 'Test Chapter 1',
        founded_date: new Date('2025-01-15'),
        status_type: 'ACTIVE',
        location_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.findUnique as jest.Mock).mockResolvedValue(mockChapter);

      // Act
      const result = await getChapterById(chapterId);

      // Assert
      expect(result).toEqual(mockChapter);
      expect(prisma.chapters.findUnique).toHaveBeenCalledWith({
        where: { chapter_id: chapterId },
      });
    });

    it('should throw NotFoundError if no chapter is found', async () => {
      // Arrange
      const chapterId = 'non-existent-id';
      (prisma.chapters.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(getChapterById(chapterId)).rejects.toThrow(
        "Chapter with id 'non-existent-id' not found"
      );
    });
  });

  describe('createChapter', () => {
    it('should create and return a new chapter', async () => {
      // Arrange
      const inputData = {
        name: 'New Chapter',
        founded_date: '2025-08-30T00:00:00.000Z',
        // FIX: Use 'as const' to tell TypeScript this is a literal type, not a general string.
        status_type: 'ACTIVE' as const,
      };
      // The data returned from prisma.create will have a Date object
      const createdChapter = {
        chapter_id: 'new-id-123',
        name: 'New Chapter',
        founded_date: new Date('2025-08-30T00:00:00.000Z'),
        status_type: 'ACTIVE',
        location_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.create as jest.Mock).mockResolvedValue(createdChapter);

      // Act
      const result = await createChapter(inputData);

      // Assert
      expect(result).toEqual(createdChapter);
      expect(prisma.chapters.create).toHaveBeenCalledWith({ data: inputData });
    });
  });

  describe('updateChapter', () => {
    it('should update and return the chapter', async () => {
      // Arrange
      const chapterId = '1';
      const updateData = { name: 'Updated Chapter Name' };
      const updatedChapter = {
        chapter_id: chapterId,
        name: 'Updated Chapter Name',
        founded_date: new Date('2025-01-15'),
        status_type: 'ACTIVE',
        location_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.update as jest.Mock).mockResolvedValue(updatedChapter);

      // Act
      const result = await updateChapter(chapterId, updateData);

      // Assert
      expect(result).toEqual(updatedChapter);
      expect(prisma.chapters.update).toHaveBeenCalledWith({
        where: { chapter_id: chapterId },
        data: updateData,
      });
    });
  });

  describe('deleteChapter', () => {
    it('should call delete with the correct ID and return the deleted chapter', async () => {
      // Arrange
      const chapterId = '1';
      const deletedChapter = {
        chapter_id: chapterId,
        name: 'Deleted Chapter',
        founded_date: new Date('2025-01-15'),
        status_type: 'INACTIVE',
        location_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.chapters.delete as jest.Mock).mockResolvedValue(deletedChapter);

      // Act
      const result = await deleteChapter(chapterId);

      // Assert
      expect(result).toEqual(deletedChapter);
      expect(prisma.chapters.delete).toHaveBeenCalledWith({
        where: { chapter_id: chapterId },
      });
    });
  });
});
