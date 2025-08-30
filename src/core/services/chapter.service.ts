// src/core/services/chapter.service.ts
import { prisma } from '../../config/database';
import { createChapterSchema, updateChapterSchema } from '../validators';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateChapterInput = z.infer<typeof createChapterSchema>;
type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

export const getAllChapters = () => {
  return prisma.chapter.findMany();
};

export const getChapterById = (id: string) => {
  return prisma.chapter.findUnique({ where: { chapter_id: id } });
};

export const createChapter = (data: CreateChapterInput) => {
  return prisma.chapter.create({ data });
};

export const updateChapter = (id: string, data: UpdateChapterInput) => {
  return prisma.chapter.update({ where: { chapter_id: id }, data });
};

export const deleteChapter = (id: string) => {
  return prisma.chapter.delete({ where: { chapter_id: id } });
};
