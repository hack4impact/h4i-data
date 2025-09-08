// src/core/validators/project.validator.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().optional(),
  repo: z.string(),
  budget: z.int().min(0, 'Budget must be a positive integer').optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
