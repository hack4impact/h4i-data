import { z } from 'zod';
import { status_type } from '@prisma/client';

export const createChapterSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  founded_date: z.coerce.date(),
  status_type: z.enum(status_type).optional().default('ACTIVE'),
  location_id: z.uuid().optional().nullable(),
});

export const updateChapterSchema = z.object({
  name: z.string().min(3).optional(),
  founded_date: z.coerce.date().optional(),
  status_type: z.enum(status_type).optional(),
  location_id: z.uuid().optional().nullable(),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
