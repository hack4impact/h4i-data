import { z } from 'zod';
import { volunteerStatusSchema } from './enums';

export const createMentorSchema = z.object({
  mentor_id: z.uuid(),
  status: volunteerStatusSchema.optional().default('ACTIVE'),
  expertise_area: z.string().optional(),
  max_mentees: z.number().int().optional(),
});

export const updateMentorSchema = createMentorSchema.partial().omit({
  mentor_id: true, // Cannot update the PK/FK
});
