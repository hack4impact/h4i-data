import { z } from 'zod';
import { roleScopeSchema } from './enums';

export const createOfficerRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters long'),
  scope: roleScopeSchema.optional(),
  rank_level: z.number().int().optional(),
});

export const updateOfficerRoleSchema = createOfficerRoleSchema.partial();
