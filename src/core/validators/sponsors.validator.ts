import { z } from 'zod';

export const createSponsorSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  contact_id: z.uuid(),
  location_id: z.uuid().optional(),
  company_id: z.uuid().optional(),
});

export const updateSponsorSchema = createSponsorSchema.partial();
