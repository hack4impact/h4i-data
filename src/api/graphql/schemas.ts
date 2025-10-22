import { chapterSchemaString } from './schemas/chapters.schema';
import { sponsorSchemaString } from './schemas/sponsors.schema';
import { volunteerSchemaString } from './schemas/volunteers.schema';
import { contactSchemaString } from './schemas/contacts.schema';
import { roleSchemaString } from './schemas/roles.schema';
import { projectSchemaString } from './schemas/projects.schema';
import { nonprofitSchemaString } from './schemas/nonprofits.schema';
import { companySchemaString } from './schemas/companies.schema';
import { locationSchemaString } from './schemas/locations.schema';

// Combine all schema strings into a single array
export const typeDefs = [
  chapterSchemaString,
  sponsorSchemaString,
  volunteerSchemaString,
  contactSchemaString,
  roleSchemaString,
  projectSchemaString,
  nonprofitSchemaString,
  locationSchemaString,
  companySchemaString,
];
