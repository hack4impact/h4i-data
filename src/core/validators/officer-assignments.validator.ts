import { z } from 'zod';

export const createOfficerAssignmentSchema = z.object({
  volunteer_id: z.uuid(),
  role_id: z.uuid(),
  chapter_id: z.uuid(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const updateOfficerAssignmentSchema =
  createOfficerAssignmentSchema.partial();
