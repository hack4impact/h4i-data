import { Prisma, chapters } from '@prisma/client';
import { prisma } from './index';

export const getChapters = async () => {
  return prisma.chapters.findMany();
};

export const getChapterById = async (id: string) => {
  return prisma.chapters.findUnique({
    where: { chapter_id: id },
    include: {
      // Example of including a relation
      locations: true,
    },
  });
};

export const createChapter = async (
  data: Prisma.chaptersCreateInput
): Promise<chapters> => {
  return prisma.chapters.create({ data });
};

export const updateChapter = async (
  id: string,
  data: Prisma.chaptersUpdateInput
): Promise<chapters | null> => {
  return prisma.chapters.update({
    where: { chapter_id: id },
    data,
  });
};

export const deleteChapter = async (id: string): Promise<chapters | null> => {
  return prisma.chapters.delete({
    where: { chapter_id: id },
  });
};
