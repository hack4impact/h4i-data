import { chapterService } from '../../../core';
import { status_type } from '@prisma/client';

// Mock the Prisma client
jest.mock('../../../config/database', () => ({
  prisma: {
    chapters: {
      create: jest.fn(),
    },
  },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('Chapter Service', () => {
  it('should create a new chapter', async () => {
    const input = {
      name: 'Test Chapter',
      founded_date: new Date('2024-01-01'),
      status_type: 'ACTIVE' as status_type,
    };

    const expectedChapter = {
      ...input,
      chapter_id: 'mock-uuid',
      created_at: new Date(),
      updated_at: new Date(),
      location_id: null,
    };

    prismaMock.chapters.create.mockResolvedValue(expectedChapter);

    const result = await chapterService.createChapter(input);

    expect(result).toEqual(expectedChapter);
    expect(prismaMock.chapters.create).toHaveBeenCalledWith({ data: input });
  });
});
