import { z } from 'zod';
import { engagementStatusSchema } from './enums';

export const createMentorshipSchema = z.object({
  mentor_id: z.uuid().optional(),
  mentee_id: z.uuid().optional(),
  program_type: z.string().optional(),
  status: engagementStatusSchema.optional().default('ACTIVE'),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateMentorshipSchema = createMentorshipSchema.partial();
