import { PrismaClient } from '@prisma/client';

// Export a single instance of PrismaClient
export const prisma = new PrismaClient();

// Function to connect to the DB, used at startup
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

// Disconnect from the DB, used at shutdown
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Failed to disconnect from the database', error);
  }
};
