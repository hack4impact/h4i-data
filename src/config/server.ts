// src/config/server.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Define a schema for your environment variables
const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL must be defined' }),
});

// Parse the environment variables.
// This will throw a detailed error if any validation fails (e.g., DATABASE_URL is missing)
export const env = envSchema.parse(process.env);
