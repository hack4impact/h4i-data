import { prisma, connectDB, disconnectDB } from '../src/config/database';

// Global test setup - runs once before all tests
beforeAll(async () => {
  // Only connect for integration tests, not unit tests
  const testFilePath = expect.getState().testPath;
  const isIntegrationTest = testFilePath?.includes('/integration/') ?? false;

  if (isIntegrationTest) {
    try {
      await connectDB();
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      process.exit(1);
    }
  }
});

// Global test teardown - runs once after all tests
afterAll(async () => {
  // Only disconnect for integration tests
  const testFilePath = expect.getState().testPath;
  const isIntegrationTest = testFilePath?.includes('/integration/') ?? false;

  if (isIntegrationTest) {
    try {
      await disconnectDB();
    } catch (error) {
      console.error('Failed to disconnect from test database:', error);
    }
  }
});

// Clean database before each test to ensure complete isolation
beforeEach(async () => {
  try {
    // Only clean for tests that actually use the database (not mocked unit tests)
    const testFilePath = expect.getState().testPath;
    const isUnitTest = testFilePath?.includes('/unit/') ?? false;

    // Skip cleanup for unit tests since they mock the database
    if (!isUnitTest) {
      // Delete in order respecting foreign key constraints
      await prisma.project_staffing.deleteMany({});
      await prisma.project_deliverables.deleteMany({});
      await prisma.project_engagements.deleteMany({});
      await prisma.officer_assignments.deleteMany({});
      await prisma.volunteer_history.deleteMany({});
      await prisma.mentorships.deleteMany({});
      await prisma.social_links.deleteMany({});
      await prisma.mentors.deleteMany({});
      await prisma.volunteers.deleteMany({});
      await prisma.academic_terms.deleteMany({});
      await prisma.universities.deleteMany({});
      await prisma.project_roles.deleteMany({});
      await prisma.officer_roles.deleteMany({});
      await prisma.projects.deleteMany({});
      await prisma.chapters.deleteMany({});
      await prisma.partners.deleteMany({});
      await prisma.constituents.deleteMany({});
      await prisma.companies.deleteMany({});
      await prisma.locations.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clean database between tests:', error);
    throw error;
  }
});
