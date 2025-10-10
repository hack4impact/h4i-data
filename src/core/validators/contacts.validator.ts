import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.email('Must be a valid email address'),
  phone: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial(); // All fields are optional
