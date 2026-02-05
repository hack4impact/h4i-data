import { z } from 'zod';

export const createOfficerAssignmentSchema = z.object({
  volunteer_id: z.uuid().optional(),
  role_id: z.uuid().optional(),
  chapter_id: z.uuid().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const updateOfficerAssignmentSchema =
  createOfficerAssignmentSchema.partial();
