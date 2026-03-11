import { z } from 'zod';
import { linkTypeSchema } from './enums';

export const createSocialLinkSchema = z.object({
  constituent_id: z.uuid(),
  platform: linkTypeSchema.optional(),
  url: z.string().url(),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();
