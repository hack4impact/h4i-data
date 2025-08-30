import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';

// Create the executable schema that combines type definitions and resolvers
export const graphqlSchema = makeExecutableSchema({ typeDefs, resolvers });
