import {
  createChapter,
  createChapterSchema,
  deleteChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  updateChapterSchema,
} from '../../../core';
import { GraphQLError } from 'graphql';

export const chapterResolvers = {
  Query: {
    chapters: () => getAllChapters(),
    chapter: async (_: any, { id }: { id: string }) => {
      const chapter = await getChapterById(id);
      if (!chapter) {
        throw new GraphQLError('Chapter not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return chapter;
    },
  },
  Mutation: {
    createChapter: (_: any, { input }: { input: any }) => {
      // Zod validation works here too!
      const validatedInput = createChapterSchema.parse(input);
      return createChapter(validatedInput);
    },
    updateChapter: (_: any, { id, input }: { id: string; input: any }) => {
      const validatedInput = updateChapterSchema.parse(input);
      return updateChapter(id, validatedInput);
    },
    deleteChapter: (_: any, { id }: { id: string }) => {
      return deleteChapter(id);
    },
  },
  // If your date fields need special formatting, you can add scalar resolvers.
  // For simplicity, we'll let them be strings as returned by Prisma.
};
