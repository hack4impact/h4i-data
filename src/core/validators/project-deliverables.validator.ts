import { z } from 'zod';
import { deliverableTypeSchema } from './enums';

export const createProjectDeliverableSchema = z.object({
  project_id: z.uuid().optional(),
  label: z.string().optional(),
  url: z.string().url().optional(),
  category: deliverableTypeSchema.optional(),
});

export const updateProjectDeliverableSchema =
  createProjectDeliverableSchema.partial();
