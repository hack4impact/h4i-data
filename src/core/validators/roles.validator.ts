import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters long'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.record(z.string(), z.boolean()),
  level_type: z.enum([
    'REGULAR_CHAPTER_VOLUNTEER_LEVEL',
    'CHAPTER_BOARD_LEVEL',
    'REGULAR_OPERATIONS_VOLUNTEER_LEVEL',
    'OPERATIONS_BOARD_LEVEL',
  ]),
});

export const updateRoleSchema = createRoleSchema.partial();
