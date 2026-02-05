import { z } from 'zod';

export const createChapterSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  university_id: z.uuid().optional(),
  location_id: z.uuid().optional(),
  founded_date: z.coerce.date().optional(),
});

export const updateChapterSchema = createChapterSchema.partial();
