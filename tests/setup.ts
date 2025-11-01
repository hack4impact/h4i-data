import { prisma, connectDB, disconnectDB } from '../src/config/database';

// Global test setup - runs once before all tests
beforeAll(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
});

// Global test teardown - runs once after all tests
afterAll(async () => {
  try {
    await disconnectDB();
  } catch (error) {
    console.error('Failed to disconnect from test database:', error);
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
      // Delete all records in dependency order (children/junction tables first, then parents)
      // Order matters due to foreign key constraints

      // Junction/linking tables (children) first
      await prisma.volunteer_role_project.deleteMany({});
      await prisma.volunteer_assignment.deleteMany({});
      await prisma.volunteer_history.deleteMany({});
      await prisma.nonprofit_chapter_project.deleteMany({});
      await prisma.sponsor_chapter.deleteMany({});

      // Main tables (depend on contacts, locations, chapters, etc.)
      await prisma.volunteers.deleteMany({});
      await prisma.nonprofits.deleteMany({});
      await prisma.sponsors.deleteMany({});
      await prisma.projects.deleteMany({});
      await prisma.roles.deleteMany({});
      await prisma.operations_branches.deleteMany({});

      // Parent tables (referenced by others)
      await prisma.chapters.deleteMany({});
      await prisma.companies.deleteMany({});
      await prisma.contacts.deleteMany({});
      await prisma.locations.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clean database between tests:', error);
    throw error;
  }
});
