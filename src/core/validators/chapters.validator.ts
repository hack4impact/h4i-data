import { z } from 'zod';
import { chapterStatusSchema } from './enums';

export const createChapterSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  university_id: z.uuid().optional(),
  location_id: z.uuid().optional(),
  founded_date: z.coerce.date().optional(),
  status: chapterStatusSchema.optional().default('ACTIVE'),
});

export const updateChapterSchema = createChapterSchema.partial();
