import { z } from 'zod';

export const createPartnerSchema = z.object({
  legal_name: z
    .string()
    .min(3, 'Legal name must be at least 3 characters long')
    .optional(),
  mission_statement: z.string().optional(),
  website_url: z.string().url().optional(),
  pcs_organization_type: z.string().optional(),
  pcs_subject: z.string().optional(),
  pcs_population: z.string().optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial();
