import { buildSchema } from 'graphql';
import { chapterSchemaString } from './schemas/';

const fullSchemaString = chapterSchemaString;
export const schema = buildSchema(fullSchemaString);
