import { z } from 'zod';
import { linkTypeSchema } from './enums';

export const createConstituentLinkSchema = z.object({
  constituent_id: z.uuid(),
  platform: linkTypeSchema.optional(),
  url: z.string().url(),
});

export const updateConstituentLinkSchema =
  createConstituentLinkSchema.partial();
