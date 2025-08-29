import dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";

dotenv.config();

// Create Prisma client instance
export const prisma = new PrismaClient();

// Create PostgreSQL pool for direct queries if needed
export const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Connect to the database
export async function connectToDB() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

// Disconnect from the database
export async function disconnectFromDB() {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected successfully");
  } catch (err) {
    console.error("Database disconnection error:", err);
    throw err;
  }
}
