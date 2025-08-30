import {
  VolunteerService,
  volunteerService,
} from '../../../src/services/volunteerService';
import {
  VolunteerValidator,
  ValidationError,
} from '../../../src/utils/validators';
import { VolunteerStatus, VolunteerType } from '../../../src/types';
import { Prisma } from '@prisma/client';

// Mock the validator and prisma
jest.mock('../../../src/utils/validators');
jest.mock('../../../src/config/database', () => ({
  prisma: {
    volunteers: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = require('../../../src/config/database');
const MockedVolunteerValidator = VolunteerValidator as jest.Mocked<
  typeof VolunteerValidator
>;

describe('VolunteerService', () => {
  const validVolunteerInput = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@test.com',
    graduation_date: new Date('2024-06-15'),
    volunteer_status: VolunteerStatus.STUDENT,
    volunteer_type: VolunteerType.CHAPTER,
    university_id: '123e4567-e89b-12d3-a456-426614174000',
  };

  const mockVolunteer = {
    volunteer_id: '987e6543-e21b-32d1-b654-426614174000',
    ...validVolunteerInput,
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    MockedVolunteerValidator.sanitizeVolunteerInput.mockImplementation(
      (data) => data
    );
    MockedVolunteerValidator.validateVolunteerInput.mockImplementation(
      () => {}
    );
    MockedVolunteerValidator.validateId.mockImplementation(() => {});
  });

  describe('getAllVolunteers', () => {
    it('should return all volunteers ordered by created_at desc', async () => {
      const mockVolunteers = [
        mockVolunteer,
        { ...mockVolunteer, volunteer_id: 'another-id' },
      ];
      prisma.volunteers.findMany.mockResolvedValue(mockVolunteers);

      const result = await volunteerService.getAllVolunteers();

      expect(prisma.volunteers.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockVolunteers);
    });

    it('should throw error when database query fails', async () => {
      prisma.volunteers.findMany.mockRejectedValue(new Error('Database error'));

      await expect(volunteerService.getAllVolunteers()).rejects.toThrow(
        'Failed to fetch volunteers from database'
      );
    });
  });

  describe('createVolunteer', () => {
    it('should create volunteer successfully with valid input', async () => {
      MockedVolunteerValidator.sanitizeVolunteerInput.mockReturnValue(
        validVolunteerInput
      );
      prisma.volunteers.create.mockResolvedValue(mockVolunteer);

      const result =
        await volunteerService.createVolunteer(validVolunteerInput);

      expect(
        MockedVolunteerValidator.sanitizeVolunteerInput
      ).toHaveBeenCalledWith(validVolunteerInput);
      expect(
        MockedVolunteerValidator.validateVolunteerInput
      ).toHaveBeenCalledWith(validVolunteerInput);
      expect(prisma.volunteers.create).toHaveBeenCalledWith({
        data: validVolunteerInput,
      });
      expect(result).toEqual(mockVolunteer);
    });

    it('should handle ValidationError from validator', async () => {
      const validationError = new ValidationError(
        'Validation failed: email is required'
      );
      MockedVolunteerValidator.validateVolunteerInput.mockImplementation(() => {
        throw validationError;
      });

      await expect(
        volunteerService.createVolunteer(validVolunteerInput)
      ).rejects.toThrow(validationError);
    });

    it('should handle Prisma duplicate email error (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      );
      prisma.volunteers.create.mockRejectedValue(prismaError);

      await expect(
        volunteerService.createVolunteer(validVolunteerInput)
      ).rejects.toThrow('A volunteer with this email already exists');
    });

    it('should handle Prisma foreign key constraint error (P2003)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        }
      );
      prisma.volunteers.create.mockRejectedValue(prismaError);

      await expect(
        volunteerService.createVolunteer(validVolunteerInput)
      ).rejects.toThrow(
        'Invalid university_id provided - university does not exist'
      );
    });

    it('should handle other Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unknown error',
        {
          code: 'P9999',
          clientVersion: '5.0.0',
        }
      );
      prisma.volunteers.create.mockRejectedValue(prismaError);

      await expect(
        volunteerService.createVolunteer(validVolunteerInput)
      ).rejects.toThrow('Database error occurred while creating volunteer');
    });

    it('should handle unexpected errors', async () => {
      prisma.volunteers.create.mockRejectedValue(new Error('Unexpected error'));

      await expect(
        volunteerService.createVolunteer(validVolunteerInput)
      ).rejects.toThrow(
        'An unexpected error occurred while creating volunteer'
      );
    });
  });

  describe('getVolunteerById', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return volunteer by ID successfully', async () => {
      prisma.volunteers.findUnique.mockResolvedValue(mockVolunteer);

      const result = await volunteerService.getVolunteerById(validId);

      expect(MockedVolunteerValidator.validateId).toHaveBeenCalledWith(validId);
      expect(prisma.volunteers.findUnique).toHaveBeenCalledWith({
        where: { volunteer_id: validId },
      });
      expect(result).toEqual(mockVolunteer);
    });

    it('should handle ValidationError from ID validator', async () => {
      const validationError = new ValidationError('Invalid ID format');
      MockedVolunteerValidator.validateId.mockImplementation(() => {
        throw validationError;
      });

      await expect(
        volunteerService.getVolunteerById('invalid-id')
      ).rejects.toThrow(validationError);
    });

    it('should throw error when volunteer not found', async () => {
      prisma.volunteers.findUnique.mockResolvedValue(null);

      await expect(volunteerService.getVolunteerById(validId)).rejects.toThrow(
        'Volunteer not found'
      );
    });

    it('should handle unexpected database errors', async () => {
      prisma.volunteers.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(volunteerService.getVolunteerById(validId)).rejects.toThrow(
        'An unexpected error occurred while fetching volunteer'
      );
    });
  });

  describe('Singleton pattern', () => {
    it('should export a singleton instance', () => {
      expect(volunteerService).toBeInstanceOf(VolunteerService);
    });
  });
});
