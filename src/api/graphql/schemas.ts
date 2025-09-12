import { chapterSchemaString } from './schemas/chapters.schema';
import { sponsorSchemaString } from './schemas/sponsors.schema';

// Combine all schema strings into a single array
export const typeDefs = [chapterSchemaString, sponsorSchemaString];
