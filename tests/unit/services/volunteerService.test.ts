// tests/unit/services/volunteerService.test.ts

import { volunteerService } from '../../../src/services/volunteerService';
import { ValidationError } from '../../../src/utils/validators';
import { VolunteerStatus, VolunteerType } from '../../../src/types';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../src/config/database';

// Mock the prisma client module. The factory function provides the mock implementation.
jest.mock('../../../src/config/database', () => ({
  prisma: {
    volunteers: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Cast the nested 'volunteers' object to its mocked type.
const mockedPrismaVolunteers = prisma.volunteers as jest.Mocked<
  typeof prisma.volunteers
>;

describe('VolunteerService', () => {
  // Define reusable mock data for our tests to ensure consistency.
  const validVolunteerInput = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@test.com',
    H4I_email: 'john.doe@hack4impact.org',
    graduation_date: '2024-06-15T00:00:00.000Z',
    volunteer_status: VolunteerStatus.STUDENT,
    volunteer_type: VolunteerType.CHAPTER,
    university_id: '123e4567-e89b-12d3-a456-426614174000',
  };

  const mockVolunteerRecord = {
    volunteer_id: '987e6543-e21b-32d1-b654-426614174000',
    ...validVolunteerInput,
    graduation_date: new Date(validVolunteerInput.graduation_date),
    chapter_id: null,
    company_id: null,
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
  };

  // Reset all mocks before each test to ensure test isolation.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVolunteers', () => {
    it('should fetch all volunteers and order them by creation date', async () => {
      // Arrange: mock the database response.
      const mockVolunteers = [mockVolunteerRecord];
      mockedPrismaVolunteers.findMany.mockResolvedValue(mockVolunteers);

      // Act: call the service method.
      const result = await volunteerService.getAllVolunteers();

      // Assert: verify the database was called correctly and the data is returned.
      expect(mockedPrismaVolunteers.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockVolunteers);
    });

    it('should throw a user-friendly error if the database query fails', async () => {
      // Arrange: mock a database failure.
      mockedPrismaVolunteers.findMany.mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert: expect the method to throw the correct error.
      await expect(volunteerService.getAllVolunteers()).rejects.toThrow(
        'Failed to fetch volunteers from the database'
      );
    });
  });

  describe('createVolunteer', () => {
    it('should successfully create a volunteer with valid data', async () => {
      // Arrange: mock the database creation call.
      mockedPrismaVolunteers.create.mockResolvedValue(mockVolunteerRecord);

      // Act: call the service method with valid input.
      const result =
        await volunteerService.createVolunteer(validVolunteerInput);

      // Assert: verify the database was called with the correct data and the result is returned.
      expect(mockedPrismaVolunteers.create).toHaveBeenCalledWith({
        data: {
          ...validVolunteerInput,
          graduation_date: new Date(validVolunteerInput.graduation_date),
        },
      });
      expect(result).toEqual(mockVolunteerRecord);
    });

    it('should throw a ValidationError for invalid input data', async () => {
      // Arrange: create invalid input data.
      const invalidInput = { ...validVolunteerInput, email: 'not-an-email' };

      // Act & Assert: expect the method to throw a ValidationError due to Zod parsing failure.
      await expect(
        volunteerService.createVolunteer(invalidInput)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw a specific error for a duplicate email (Prisma P2002 error)', async () => {
      // Arrange: mock the specific Prisma error for a unique constraint violation.
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      );
      mockedPrismaVolunteers.create.mockRejectedValue(prismaError);

      // Act & Assert: expect a user-friendly "already exists" error message.
      await expect(
        volunteerService.createVolunteer(validVolunteerInput)
      ).rejects.toThrow('A volunteer with this email already exists');
    });
  });

  describe('getVolunteerById', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';

    it('should successfully return a volunteer when a valid ID is found', async () => {
      // Arrange: mock the database response for a found volunteer.
      mockedPrismaVolunteers.findUnique.mockResolvedValue(mockVolunteerRecord);

      // Act: call the service method.
      const result = await volunteerService.getVolunteerById(validId);

      // Assert: verify the database was called correctly and the record is returned.
      expect(mockedPrismaVolunteers.findUnique).toHaveBeenCalledWith({
        where: { volunteer_id: validId },
      });
      expect(result).toEqual(mockVolunteerRecord);
    });

    it('should throw an error when no volunteer is found', async () => {
      // Arrange: mock the database response for a not-found volunteer.
      mockedPrismaVolunteers.findUnique.mockResolvedValue(null);

      // Act & Assert: expect a "not found" error.
      await expect(volunteerService.getVolunteerById(validId)).rejects.toThrow(
        'Volunteer not found'
      );
    });

    it('should throw a ValidationError for an invalid ID format', async () => {
      // Act & Assert: call the service with an invalid ID and expect a validation error.
      await expect(
        volunteerService.getVolunteerById('invalid-uuid-format')
      ).rejects.toThrow('Invalid ID format. Must be a valid UUID');
    });
  });
});
