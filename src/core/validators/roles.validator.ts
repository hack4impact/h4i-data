import { z } from 'zod';
import { level_type } from '@prisma/client';

export const createRoleSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters long'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.record(z.string(), z.boolean()),
  level_type: z.nativeEnum(level_type).optional(),
});

export const updateRoleSchema = createRoleSchema.partial();
