import { prisma } from '../../src/config/database';
import { VolunteerStatus, VolunteerType } from '../../src/types/enums';

export const mockVolunteerData = {
  // Standard student volunteer for testing
  validStudent: {
    first_name: 'John',
    last_name: 'Student',
    email: 'john.student@test.com',
    graduation_date: new Date('2026-06-15'),
    volunteer_status: VolunteerStatus.STUDENT,
    H4I_email: 'john@hack4impact.org',
    volunteer_type: VolunteerType.BOTH,
    university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
  },

  // Professional volunteer for testing
  validProfessional: {
    first_name: 'Jane',
    last_name: 'Professional',
    email: 'jane.pro@test.com',
    graduation_date: new Date('2022-05-20'),
    volunteer_status: VolunteerStatus.PROFESSIONAL,
    H4I_email: 'jane@hack4impact.org',
    volunteer_type: VolunteerType.NATIONALS,
    university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
  },

  // Invalid data for testing validation errors
  invalidEmail: {
    first_name: 'Bad',
    last_name: 'Email',
    email: 'not-an-email', // invalid email format
    graduation_date: new Date('2026-06-15'),
    volunteer_status: VolunteerStatus.STUDENT,
    volunteer_type: VolunteerType.CHAPTER,
    university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
  },

  // Missing required fields
  missingFields: {
    first_name: 'Missing',
    // last_name missing
    email: 'missing@test.com',
    graduation_date: new Date('2026-06-15'),
    volunteer_status: VolunteerStatus.STUDENT,
    volunteer_type: VolunteerType.CHAPTER,
    university_id: '860b69b4-a14e-41d9-a367-2632b342e549',
  },

  // Invalid UUID
  invalidUUID: {
    first_name: 'Bad',
    last_name: 'UUID',
    email: 'bad.uuid@test.com',
    graduation_date: new Date('2026-06-15'),
    volunteer_status: VolunteerStatus.STUDENT,
    volunteer_type: VolunteerType.CHAPTER,
    university_id: 'not-a-uuid', // invalid UUID format
  },
};

// Helper functions to create/cleanup test data
export const createTestVolunteer = async (
  data = mockVolunteerData.validStudent
) => {
  return await prisma.volunteers.create({ data });
};

export const cleanupTestData = async () => {
  // Only delete test data (emails containing @test.com)
  await prisma.volunteers.deleteMany({
    where: { email: { contains: '@test.com' } },
  });
};
