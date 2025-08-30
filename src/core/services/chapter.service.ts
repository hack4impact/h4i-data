import { prisma } from '../../config/database';
import { CreateChapterInput, UpdateChapterInput } from '../validators';

export const getAllChapters = async () => {
  return prisma.chapters.findMany();
};

export const getChapterById = async (id: string) => {
  return prisma.chapters.findUnique({
    where: { chapter_id: id },
  });
};

export const createChapter = async (data: CreateChapterInput) => {
  return prisma.chapters.create({
    data,
  });
};

export const updateChapter = async (id: string, data: UpdateChapterInput) => {
  return prisma.chapters.update({
    where: { chapter_id: id },
    data,
  });
};

export const deleteChapter = async (id: string) => {
  return prisma.chapters.delete({
    where: { chapter_id: id },
  });
};
