import { z } from 'zod';
import { socialPlatformTypeSchema } from './enums';

export const createSocialLinkSchema = z.object({
  constituent_id: z.uuid().optional(),
  platform: socialPlatformTypeSchema.optional(),
  url: z.string().url().optional(),
  is_featured: z.boolean().optional().default(false),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();
