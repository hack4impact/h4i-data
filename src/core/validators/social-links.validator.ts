import { z } from 'zod';
import { socialPlatformTypeSchema } from './enums';

export const createSocialLinkSchema = z.object({
  constituent_id: z.uuid(),
  platform: socialPlatformTypeSchema.optional(),
  url: z.string().url(),
  is_featured: z.boolean().optional().default(false),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();
