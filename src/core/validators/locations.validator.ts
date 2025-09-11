import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  address: z.string().min(3, 'Address must be at least 3 characters long'),
  country_code: z
    .string()
    .length(2, 'Country code must be exactly 2 characters'),
  subdivision_code: z
    .string()
    .length(2, 'Subdivision code must be exactly 2 characters'),
});

export const updateLocationSchema = createLocationSchema.partial();
