import { prisma } from "../src/config/database";

// global setup for all tests
beforeAll(async () => {
  // any global setup needed
});

// global cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
