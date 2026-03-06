import {
  createSocialLink,
  createSocialLinkSchema,
  deleteSocialLink,
  getAllSocialLinks,
  getSocialLinkById,
  updateSocialLink,
  updateSocialLinkSchema,
} from '../../../core';
import { NotFoundError } from '../../../middleware/error.middleware';
import { z } from 'zod';

type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;

export const socialLinkResolvers = {
  Query: {
    socialLinks: () => getAllSocialLinks(),
    socialLink: async (_parent: unknown, { id }: { id: string }) => {
      try {
        return await getSocialLinkById(id);
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },
  },
  Mutation: {
    createSocialLink: (
      _parent: unknown,
      { input }: { input: CreateSocialLinkInput }
    ) => {
      const validatedInput = createSocialLinkSchema.parse(input);
      return createSocialLink(validatedInput);
    },
    updateSocialLink: (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateSocialLinkInput }
    ) => {
      const validatedInput = updateSocialLinkSchema.parse(input);
      return updateSocialLink(id, validatedInput);
    },
    deleteSocialLink: (_parent: unknown, { id }: { id: string }) => {
      return deleteSocialLink(id);
    },
  },
};
