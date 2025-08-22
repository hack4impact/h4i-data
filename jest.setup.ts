// jest.setup.ts
let prisma: any;

beforeAll(() => {
  const { PrismaClient } = require('@prisma/client'); // dynamic require
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn'],
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
