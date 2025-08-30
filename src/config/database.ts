// Database configuration and connection management
// This file sets up both Prisma ORM and raw PostgreSQL connections for the application

import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

// Ensure environment variables are loaded before creating database connections
dotenv.config();

/**
 * Prisma client instance for type-safe database operations.
 * Prisma provides:
 * - Type safety with TypeScript
 * - Automatic query generation
 * - Schema migrations
 * - Connection pooling
 * This is the primary way to interact with the database in this application.
 */
export const prisma = new PrismaClient();

/**
 * Raw PostgreSQL connection pool for direct SQL queries when needed.
 * This is useful for:
 * - Complex raw SQL queries that Prisma can't handle
 * - Database admin operations
 * - Performance-critical queries
 * 
 * SSL configuration is set to accept self-signed certificates, which is
 * common for cloud database providers like Supabase.
 */
export const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    // Accept self-signed certificates (required for many cloud DB providers)
    rejectUnauthorized: false,
  },
});

/**
 * Establishes connection to the database using Prisma.
 * This should be called once during application startup.
 * 
 * @throws Error if connection fails - this will prevent app startup
 */
export async function connectToDB() {
  try {
    // Test the connection by attempting to connect
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    throw err; // Re-throw to prevent app from starting with broken DB
  }
}

/**
 * Cleanly closes the database connection using Prisma.
 * This should be called during application shutdown to:
 * - Close connection pools properly
 * - Prevent connection leaks
 * - Allow graceful process termination
 * 
 * @throws Error if disconnection fails - logged but doesn't prevent shutdown
 */
export async function disconnectFromDB() {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (err) {
    console.error('Database disconnection error:', err);
    throw err; // Re-throw for proper error logging in shutdown handler
  }
}
