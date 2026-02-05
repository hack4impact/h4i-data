import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  industry: z.string().optional(),
  location_id: z.uuid().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
