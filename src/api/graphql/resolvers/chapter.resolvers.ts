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
import { z } from 'zod';

// Infer TypeScript types directly from your Zod schemas
type CreateChapterInput = z.infer<typeof createChapterSchema>;
type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

export const chapterResolvers = {
  Query: {
    chapters: () => getAllChapters(),
    chapter: async (_parent: unknown, { id }: { id: string }) => {
      const chapter = await getChapterById(id);
      if (!chapter) {
        // This is the version-compatible way to create the error
        throw new GraphQLError(
          'Chapter not found',
          undefined, // nodes
          undefined, // source
          undefined, // positions
          undefined, // path
          undefined, // originalError
          { code: 'NOT_FOUND' } // extensions
        );
      }
      return chapter;
    },
  },
  Mutation: {
    createChapter: (
      _parent: unknown,
      { input }: { input: CreateChapterInput }
    ) => {
      // Zod validation is still important for runtime safety
      const validatedInput = createChapterSchema.parse(input);
      return createChapter(validatedInput);
    },
    updateChapter: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateChapterInput }
    ) => {
      const validatedInput = updateChapterSchema.parse(input);
      return updateChapter(id, validatedInput);
    },
    deleteChapter: (_parent: unknown, { id }: { id: string }) => {
      return deleteChapter(id);
    },
  },
};
