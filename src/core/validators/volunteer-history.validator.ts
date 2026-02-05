import { z } from 'zod';
import { actionTypeSchema } from './enums';

export const createVolunteerHistorySchema = z.object({
  volunteer_id: z.uuid().optional(),
  action_type: actionTypeSchema.optional(),
  related_entity_id: z.uuid().optional(),
  previous_value_label: z.string().optional(),
  new_value_label: z.string().optional(),
  effective_date: z.coerce.date().optional(),
});

export const updateVolunteerHistorySchema =
  createVolunteerHistorySchema.partial();
