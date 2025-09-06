// src/core/services/chapter.service.ts
import { prisma } from '../../config/database';
import { createChapterSchema, updateChapterSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateChapterInput = z.infer<typeof createChapterSchema>;
type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

export const getAllChapters = async () => {
  try {
    logger.info('Fetching all chapters');
    const chapters = await prisma.chapters.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved chapters', {
      count: chapters.length,
    });

    return chapters;
  } catch (error) {
    logger.error('Failed to fetch chapters', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve chapters');
  }
};

export const getChapterById = async (id: string) => {
  try {
    logger.info('Fetching chapter by ID', { chapterId: id });

    const chapter = await prisma.chapters.findUnique({
      where: { chapter_id: id },
    });

    if (!chapter) {
      logger.warn('Chapter not found', { chapterId: id });
      throw new NotFoundError('Chapter', id);
    }

    logger.info('Successfully retrieved chapter', {
      chapterId: id,
      chapterName: chapter.name,
    });

    return chapter;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch chapter by ID', {
      chapterId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve chapter');
  }
};

export const createChapter = async (data: CreateChapterInput) => {
  try {
    logger.info('Creating new chapter', {
      chapterName: data.name,
      chapterData: data,
    });

    const chapter = await prisma.chapters.create({ data });

    logger.info('Successfully created chapter', {
      chapterId: chapter.chapter_id,
      chapterName: chapter.name,
    });

    return chapter;
  } catch (error) {
    logger.error('Failed to create chapter', {
      chapterData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create chapter');
  }
};

export const updateChapter = async (id: string, data: UpdateChapterInput) => {
  try {
    logger.info('Updating chapter', {
      chapterId: id,
      updateData: data,
    });

    const chapter = await prisma.chapters.update({
      where: { chapter_id: id },
      data,
    });

    logger.info('Successfully updated chapter', {
      chapterId: id,
      chapterName: chapter.name,
    });

    return chapter;
  } catch (error) {
    logger.error('Failed to update chapter', {
      chapterId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if chapter doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Chapter', id);
    }

    throw new DatabaseError('Failed to update chapter');
  }
};

export const deleteChapter = async (id: string) => {
  try {
    logger.info('Deleting chapter', { chapterId: id });

    const chapter = await prisma.chapters.delete({
      where: { chapter_id: id },
    });

    logger.info('Successfully deleted chapter', {
      chapterId: id,
      chapterName: chapter.name,
    });

    return chapter;
  } catch (error) {
    logger.error('Failed to delete chapter', {
      chapterId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if chapter doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Chapter', id);
    }

    throw new DatabaseError('Failed to delete chapter');
  }
};
