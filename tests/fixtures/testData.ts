import { prisma } from "../../src/config/database";

export const mockVolunteerData = {
  // standard student volunteer for testing
  validStudent: {
    first_name: "John",
    last_name: "Student",
    email: "john.student@test.com", // make sure email includes test.com in order to delete with helper
    graduation_date: new Date("2026-06-15"),
    volunteer_status: "STUDENT",
    H4I_email: "john@hack4impact.org",
    volunteer_type: "CHAPTER",
    university_id: "860b69b4-a14e-41d9-a367-2632b342e549",
  },

  // professional volunteer for testing
  validProfessional: {
    first_name: "Jane",
    last_name: "Professional",
    email: "jane.pro@test.com",
    graduation_date: new Date("2022-05-20"),
    volunteer_status: "PROFESSIONAL",
    H4I_email: "jane@hack4impact.org",
    volunteer_type: "NATIONALS",
    university_id: "860b69b4-a14e-41d9-a367-2632b342e549",
  },

  // invalid data for testing error cases
  invalidEmail: {
    first_name: "Bad",
    last_name: "Email",
    email: "not-an-email", // invalid email format
    graduation_date: new Date("2026-06-15"),
    volunteer_status: "STUDENT",
    volunteer_type: "CHAPTER",
    university_id: "860b69b4-a14e-41d9-a367-2632b342e549",
  },
};

// helper functions to create/cleanup test data
export const createTestVolunteer = async (
  data = mockVolunteerData.validStudent,
) => {
  return await prisma.volunteers.create({ data });
};

export const cleanupTestData = async () => {
  // only delete test data (emails containing @test.com)
  await prisma.volunteers.deleteMany({
    where: { email: { contains: "@test.com" } },
  });
};
