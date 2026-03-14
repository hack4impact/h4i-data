import { z } from 'zod';

export const createMajorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

export const updateMajorSchema = createMajorSchema.partial();
