import { PrismaClient } from "./generated/prisma";

// Extend the global object to hold a SINGLE PrismaClient instance in dev
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use the existing global prisma if available (dev only), otherwise create a new one
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn'],
  });

// Assign to global in dev to prevent multiple instances in watch mode / Jest
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}