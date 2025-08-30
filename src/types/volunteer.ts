import { z } from 'zod';
import { VolunteerStatus, VolunteerType } from './enums';

export const volunteerSchema = z.object({
  first_name: z.string().trim().min(1, { message: 'first_name is required' }),
  last_name: z.string().trim().min(1, { message: 'last_name is required' }),
  email: z.email({ message: 'Invalid email format' }),
  graduation_date: z.coerce.date(),
  volunteer_status: z.enum(VolunteerStatus),
  volunteer_type: z.enum(VolunteerType),
  university_id: z.uuid({
    message: 'Invalid university_id format. Must be a valid UUID',
  }),
  H4I_email: z.email().optional(),
});

export type VolunteerInput = z.infer<typeof volunteerSchema>;
