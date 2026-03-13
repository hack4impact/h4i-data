import {
  createConstituentLink,
  createConstituentLinkSchema,
  deleteConstituentLink,
  getAllConstituentLinks,
  getConstituentLinkById,
  updateConstituentLink,
  updateConstituentLinkSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateConstituentLinkInput = z.infer<typeof createConstituentLinkSchema>;
type UpdateConstituentLinkInput = z.infer<typeof updateConstituentLinkSchema>;

export const constituentLinkResolvers = {
  Query: {
    constituentLinks: () => getAllConstituentLinks(),
    constituentLink: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getConstituentLinkById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createConstituentLink: (
      _parent: unknown,
      { input }: { input: CreateConstituentLinkInput }
    ) => {
      const validatedInput = createConstituentLinkSchema.parse(input);
      return createConstituentLink(validatedInput);
    },
    updateConstituentLink: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateConstituentLinkInput }
    ) => {
      const validatedInput = updateConstituentLinkSchema.parse(input);
      return updateConstituentLink(id, validatedInput);
    },
    deleteConstituentLink: (_parent: unknown, { id }: { id: string }) => {
      return deleteConstituentLink(id);
    },
  },
};
