import { z } from 'zod';

export const createProjectStaffingSchema = z.object({
  volunteer_id: z.uuid(),
  engagement_id: z.uuid(),
  role_id: z.uuid().optional(),
  is_lead_contact: z.boolean().optional().default(false),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const updateProjectStaffingSchema =
  createProjectStaffingSchema.partial();
