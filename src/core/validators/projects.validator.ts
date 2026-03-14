import { z } from 'zod';
import { projectStatusSchema } from './enums';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  github_url: z.string().url().optional(),
  status: projectStatusSchema.optional().default('SCOPING'),
});

export const updateProjectSchema = createProjectSchema.partial();
