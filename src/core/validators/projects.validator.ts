import { z } from 'zod';
import { financialTypeSchema } from './enums';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  github_url: z.string().url().optional(),
  financial: financialTypeSchema.optional().default('PRO_BONO'),
});

export const updateProjectSchema = createProjectSchema.partial();
