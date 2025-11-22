// src/config/server.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: process.env.NODE_ENV === 'test',
});

// Define a schema for your environment variables
const envSchema = z.object({
  // Port for the main integrated server (npm run dev)
  PORT: z.coerce.number().default(3001),
  // Port for the standalone REST server (npm run dev:rest)
  REST_PORT: z.coerce.number().default(3002),
  // Port for the standalone GraphQL server (npm run dev:graphql)
  GRAPHQL_PORT: z.coerce.number().default(3003),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL must be defined' }),
  // Database connection pool settings (optional)
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),
  DB_POOL_TIMEOUT: z.coerce.number().default(30000),
});

// Parse the environment variables.
export const env = envSchema.parse(process.env);
