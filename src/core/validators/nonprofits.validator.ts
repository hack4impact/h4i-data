import { z } from 'zod';

export const createNonprofitSchema = z.object({
  name: z.string().min(1),
  mission: z.string().min(1),
  contact_id: z.string().min(1),
  website: z.string().url().optional().nullable(),
  location_id: z.string().optional().nullable(), 
});

export const updateNonprofitSchema = createNonprofitSchema.partial();
