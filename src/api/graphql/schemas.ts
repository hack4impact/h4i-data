// Shared Enums (must come first — referenced by other schemas)
import { enumsSchemaString } from './schemas/enums.schema';

// Core Entity Schemas
import { chapterSchemaString } from './schemas/chapters.schema';
import { companySchemaString } from './schemas/companies.schema';
import { constituentSchemaString } from './schemas/constituents.schema';
import { locationSchemaString } from './schemas/locations.schema';
import { partnerSchemaString } from './schemas/partners.schema';
import { projectSchemaString } from './schemas/projects.schema';
import { officerRoleSchemaString } from './schemas/officer-roles.schema';
import { volunteerSchemaString } from './schemas/volunteers.schema';
import { mentorSchemaString } from './schemas/mentors.schema';

// Supporting Entity Schemas
import { majorSchemaString } from './schemas/majors.schema';
import { universitySchemaString } from './schemas/universities.schema';
import { academicTermSchemaString } from './schemas/academic-terms.schema';
import { projectRoleSchemaString } from './schemas/project-roles.schema';
import { socialLinkSchemaString } from './schemas/social-links.schema';

// Relation Entity Schemas
import { volunteerHistorySchemaString } from './schemas/volunteer-history.schema';
import { officerAssignmentSchemaString } from './schemas/officer-assignments.schema';
import { mentorshipSchemaString } from './schemas/mentorships.schema';
import { projectDeliverableSchemaString } from './schemas/project-deliverables.schema';
import { projectEngagementSchemaString } from './schemas/project-engagements.schema';
import { projectStaffingSchemaString } from './schemas/project-staffing.schema';

// Combine all schema strings into a single array
export const typeDefs = [
  // Shared Enums
  enumsSchemaString,

  // Core Entities
  chapterSchemaString,
  companySchemaString,
  constituentSchemaString,
  locationSchemaString,
  partnerSchemaString,
  projectSchemaString,
  officerRoleSchemaString,
  volunteerSchemaString,
  mentorSchemaString,

  // Supporting Entities
  majorSchemaString,
  universitySchemaString,
  academicTermSchemaString,
  projectRoleSchemaString,
  socialLinkSchemaString,

  // Relation Entities
  volunteerHistorySchemaString,
  officerAssignmentSchemaString,
  mentorshipSchemaString,
  projectDeliverableSchemaString,
  projectEngagementSchemaString,
  projectStaffingSchemaString,
];
