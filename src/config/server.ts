// src/config/server.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Define a schema for your environment variables
const envSchema = z.object({
  // Port for the main integrated server (npm run dev)
  PORT: z.coerce.number().default(4000),
  // Port for the standalone REST server (npm run dev:rest)
  REST_PORT: z.coerce.number().default(4001),
  // Port for the standalone GraphQL server (npm run dev:graphql)
  GRAPHQL_PORT: z.coerce.number().default(4002),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL must be defined' }),
});

// Parse the environment variables.
export const env = envSchema.parse(process.env);
