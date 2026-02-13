import { z } from 'zod';
import {
  volunteerClassSchema,
  engagementTrackSchema,
  educationLevelSchema,
  memberStatusSchema,
} from './enums';

export const createVolunteerSchema = z.object({
  // volunteer_id is a FK to constituents, required for create
  volunteer_id: z.uuid(),
  org_email: z.string().email().optional(),
  status: memberStatusSchema.optional().default('ACTIVE'),
  volunteer_class: volunteerClassSchema.optional().default('COLLEGIATE'),
  engagement_track: engagementTrackSchema.optional().default('PROGRAMS'),
  major_id: z.uuid().optional(),
  education_level: educationLevelSchema.optional(),
  graduation_term_id: z.uuid().optional(),
  university_id: z.uuid().optional(),
  home_chapter_id: z.uuid().optional(),
  employer_id: z.uuid().optional(),
});

export const updateVolunteerSchema = createVolunteerSchema.partial().omit({
  volunteer_id: true, // Cannot update the PK/FK
});
