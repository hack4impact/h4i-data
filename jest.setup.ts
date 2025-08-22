import { prisma } from './prisma';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Cleanup database after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
