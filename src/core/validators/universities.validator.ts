import { z } from 'zod';

export const createUniversitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  email_domain: z.string().optional(),
  location_id: z.uuid().optional(),
});

export const updateUniversitySchema = createUniversitySchema.partial();
