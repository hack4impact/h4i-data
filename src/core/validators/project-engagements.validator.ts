import { z } from 'zod';
import { engagementStatusSchema, domainTypeSchema } from './enums';

export const createProjectEngagementSchema = z.object({
  project_id: z.uuid().optional(),
  partner_id: z.uuid().optional(),
  chapter_id: z.uuid().optional(),
  academic_term_id: z.uuid().optional(),
  client_contact_id: z.uuid().optional(),
  status: engagementStatusSchema.optional().default('ACTIVE'),
  domain: domainTypeSchema.optional().default('FULL_STACK'),
});

export const updateProjectEngagementSchema =
  createProjectEngagementSchema.partial();
