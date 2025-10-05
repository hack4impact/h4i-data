import { chapterSchemaString } from './schemas/chapters.schema';
import { sponsorSchemaString } from './schemas/sponsors.schema';
import { volunteerSchemaString } from './schemas/volunteers.schema';
import { contactSchemaString } from './schemas/contacts.schema';
import { roleSchemaString } from './schemas/roles.schema';

// Combine all schema strings into a single array
export const typeDefs = [
  chapterSchemaString,
  sponsorSchemaString,
  volunteerSchemaString,
  contactSchemaString,
  roleSchemaString,
];
