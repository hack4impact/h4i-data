// src/schemas/volunteer.schema.ts

import { z } from 'zod';
import { VolunteerStatus, VolunteerType } from '../src/types';

/**
 * Zod schema for validating new volunteer input.
 * This schema defines the shape, types, and validation rules for creating a volunteer.
 * It is the single source of truth for validation throughout the application.
 */
export const volunteerSchema = z.object({
  first_name: z.string().trim().min(1, { message: 'First name is required' }),
  last_name: z.string().trim().min(1, { message: 'Last name is required' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email format' }),
  H4I_email: z
    .email({ message: 'Invalid H4I email format' })
    .trim()
    .toLowerCase()
    .optional(),
  graduation_date: z.coerce.date({
    errorMap: () => ({
      message:
        'Invalid graduation_date format. Use ISO 8601 format (YYYY-MM-DD)',
    }),
  }),
  volunteer_status: z.enum(VolunteerStatus, {
    errorMap: () => ({
      message: `Invalid volunteer_status. Must be one of: ${Object.values(VolunteerStatus).join(', ')}`,
    }),
  }),
  volunteer_type: z.enum(VolunteerType, {
    errorMap: () => ({
      message: `Invalid volunteer_type. Must be one of: ${Object.values(VolunteerType).join(', ')}`,
    }),
  }),
  university_id: z
    .string()
    .trim()
    .uuid({ message: 'Invalid university_id format. Must be a valid UUID' }),
});

// We infer the TypeScript type directly from the schema.
// This ensures our validation rules and types are always in sync.
export type VolunteerInput = z.infer<typeof volunteerSchema>;
