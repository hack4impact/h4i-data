import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().optional(),
  repo: z.string(),
  budget: z.int().min(0, 'Budget must be a positive integer').optional(),
  project_type: z.enum([
    'DESIGN_ONLY',
    'DEVELOP_ONLY',
    'DESIGN_AND_DEVELOP',
    'CONSULT',
    'MAINTAIN',
  ]),
});

export const updateProjectSchema = createProjectSchema.partial();
