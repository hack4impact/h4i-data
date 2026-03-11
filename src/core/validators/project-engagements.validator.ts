import { z } from 'zod';
import {
  engagementStatusSchema,
  financialTypeSchema,
  projectTypeSchema,
} from './enums';

export const createProjectEngagementSchema = z.object({
  project_id: z.uuid(),
  partner_id: z.uuid().optional(),
  chapter_id: z.uuid().optional(),
  academic_term_id: z.uuid().optional(),
  client_contact_id: z.uuid().optional(),
  status: engagementStatusSchema.optional().default('ACTIVE'),
  domain: projectTypeSchema.optional().default('FULL_STACK'),
  financial: financialTypeSchema.optional().default('PRO_BONO'),
});

export const updateProjectEngagementSchema =
  createProjectEngagementSchema.partial();
