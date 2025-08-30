// src/core/validators/chapter.validator.ts
import { z } from 'zod';

export const createChapterSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  founded_date: z.string().datetime(), // Expects ISO 8601 date string
  status_type: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  location_id: z.string().uuid().optional(),
});

export const updateChapterSchema = createChapterSchema.partial(); // All fields are optional
