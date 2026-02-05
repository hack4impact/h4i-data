import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  address_line: z
    .string()
    .min(3, 'Address line must be at least 3 characters long')
    .optional(),
  state_code: z
    .string()
    .length(2, 'State code must be exactly 2 characters')
    .optional(),
  country_code: z
    .string()
    .length(3, 'Country code must be exactly 3 characters')
    .default('USA'),
});

export const updateLocationSchema = createLocationSchema.partial();
