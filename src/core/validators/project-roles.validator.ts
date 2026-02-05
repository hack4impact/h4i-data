import { z } from 'zod';

export const createProjectRoleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  is_leadership: z.boolean().optional().default(false),
});

export const updateProjectRoleSchema = createProjectRoleSchema.partial();
