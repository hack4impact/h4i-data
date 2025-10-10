import { z } from 'zod';

export const createVolunteerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Must be a valid email address'),
  graduation_date: z.iso.datetime(),
  volunteer_status: z.enum(['STUDENT', 'PROFESSIONAL']),
  h4i_email: z.email('Must be a valid H4I email address').optional(),
  volunteer_type: z.enum(['CHAPTER', 'BOTH', 'OPERATIONS']),
  university_id: z.uuid(),
  chapter_id: z.uuid().optional(),
  company_id: z.uuid().optional(),
});

export const updateVolunteerSchema = createVolunteerSchema.partial();
