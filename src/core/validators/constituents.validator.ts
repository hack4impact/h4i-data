import { z } from 'zod';

export const createConstituentSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  primary_email: z.string().email('Must be a valid email address'),
  phone_number: z.string().optional(),
});

export const updateConstituentSchema = createConstituentSchema.partial();
