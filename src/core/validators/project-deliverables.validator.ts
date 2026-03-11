import { z } from 'zod';
import { projectResourceTypeSchema } from './enums';

export const createProjectDeliverableSchema = z.object({
  project_id: z.uuid(),
  label: z.string().optional(),
  url: z.string().url().optional(),
  category: projectResourceTypeSchema.optional(),
});

export const updateProjectDeliverableSchema =
  createProjectDeliverableSchema.partial();
