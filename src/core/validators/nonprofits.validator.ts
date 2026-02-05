import { z } from 'zod';

export const createNonprofitSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  mission: z.string().min(5, 'Mission must be at least 5 characters long'),
  website: z.url().optional(),
  location_id: z.uuid().optional(),
  contact_id: z.uuid(),
});

export const updateNonprofitSchema = createNonprofitSchema.partial();
