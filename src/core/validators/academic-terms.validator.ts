import { z } from 'zod';
import { termTypeSchema } from './enums';

export const createAcademicTermSchema = z.object({
  university_id: z.uuid().optional(),
  name: z.string().optional(),
  canonical_label: z.string().optional(),
  type: termTypeSchema.optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const updateAcademicTermSchema = createAcademicTermSchema.partial();
