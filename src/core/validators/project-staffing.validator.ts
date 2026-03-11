import { z } from 'zod';

export const createProjectStaffingSchema = z.object({
  volunteer_id: z.uuid(),
  project_engagement_id: z.uuid(),
  project_role_id: z.uuid().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const updateProjectStaffingSchema =
  createProjectStaffingSchema.partial();
