import { z } from 'zod';
import { actionTypeSchema, entityTypeSchema } from './enums';

export const createVolunteerHistorySchema = z.object({
  volunteer_id: z.uuid(),
  action_type: actionTypeSchema,
  related_entity_id: z.uuid().optional(),
  related_entity_type: entityTypeSchema.optional(),
  previous_value_label: z.string().optional(),
  new_value_label: z.string().optional(),
  effective_date: z.coerce.date(),
});

export const updateVolunteerHistorySchema =
  createVolunteerHistorySchema.partial();
