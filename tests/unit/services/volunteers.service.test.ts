import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    volunteers: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    constituents: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Volunteer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVolunteers', () => {
    it('should return an array of volunteers with constituents', async () => {
      const mockVolunteers = [
        {
          volunteer_id: 'const-1',
          org_email: 'john@org.edu',
          status: 'ACTIVE',
          volunteer_class: 'COLLEGIATE',
          engagement_track: 'CHAPTER',
          major_id: 'major-1',
          education_level: 'UNDERGRADUATE',
          graduation_term_id: 'term-1',
          university_id: 'univ-1',
          home_chapter_id: 'chapter-1',
          employer_id: null,
          created_at: new Date(),
          updated_at: new Date(),
          constituents: {
            constituent_id: 'const-1',
            first_name: 'John',
            last_name: 'Doe',
            primary_email: 'john@example.com',
            phone_number: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ];
      (prisma.volunteers.findMany as jest.Mock).mockResolvedValue(
        mockVolunteers
      );

      const result = await getAllVolunteers();

      expect(result).toEqual(mockVolunteers);
    });

    it('should return empty array when no volunteers exist', async () => {
      (prisma.volunteers.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllVolunteers();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.volunteers.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllVolunteers()).rejects.toThrow(
        'Failed to retrieve volunteers'
      );
    });
  });

  describe('getVolunteerById', () => {
    it('should return a single volunteer with constituent when a valid ID is provided', async () => {
      const volunteerId = 'const-1';
      const mockVolunteer = {
        volunteer_id: volunteerId,
        org_email: 'john@org.edu',
        status: 'ACTIVE',
        volunteer_class: 'COLLEGIATE',
        engagement_track: 'CHAPTER',
        major_id: 'major-1',
        education_level: 'UNDERGRADUATE',
        graduation_term_id: 'term-1',
        university_id: 'univ-1',
        home_chapter_id: 'chapter-1',
        employer_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        constituents: {
          constituent_id: 'const-1',
          first_name: 'John',
          last_name: 'Doe',
          primary_email: 'john@example.com',
          phone_number: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(
        mockVolunteer
      );

      const result = await getVolunteerById(volunteerId);

      expect(result).toEqual(mockVolunteer);
    });

    it('should throw NotFoundError if no volunteer is found', async () => {
      const volunteerId = 'non-existent-id';
      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getVolunteerById(volunteerId)).rejects.toThrow(
        "Volunteer with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.volunteers.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getVolunteerById('1')).rejects.toThrow(
        'Failed to retrieve volunteer'
      );
    });
  });

  describe('createVolunteer', () => {
    it('should create and return a new volunteer with constituent check', async () => {
      const constituentId = 'const-2';
      const inputData = {
        volunteer_id: constituentId,
        org_email: 'jane@org.edu',
        status: 'ACTIVE' as const,
        volunteer_class: 'COLLEGIATE' as const,
        engagement_track: 'CHAPTER' as const,
        major_id: 'major-2',
        education_level: 'UNDERGRADUATE' as const,
        university_id: 'univ-1',
        home_chapter_id: 'chapter-1',
      };

      const mockConstituent = {
        constituent_id: constituentId,
        first_name: 'Jane',
        last_name: 'Doe',
        primary_email: 'jane@example.com',
        phone_number: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const createdVolunteer = {
        ...inputData,
        graduation_term_id: null,
        employer_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        constituents: mockConstituent,
      };

      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue(
        mockConstituent
      );
      (prisma.volunteers.create as jest.Mock).mockResolvedValue(
        createdVolunteer
      );

      const result = await createVolunteer(inputData);

      expect(result).toEqual(createdVolunteer);
      expect(prisma.constituents.findUnique).toHaveBeenCalled();
      expect(prisma.volunteers.create).toHaveBeenCalled();
    });

    it('should throw NotFoundError if constituent does not exist', async () => {
      const inputData = {
        volunteer_id: 'non-existent-const',
        org_email: 'test@org.edu',
        status: 'ACTIVE' as const,
        volunteer_class: 'COLLEGIATE' as const,
        engagement_track: 'CHAPTER' as const,
      };

      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createVolunteer(inputData)).rejects.toThrow(
        "Constituent with id 'non-existent-const' not found"
      );
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue({
        constituent_id: 'const-1',
      });
      (prisma.volunteers.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createVolunteer({
          volunteer_id: 'const-1',
          org_email: 'test@org.edu',
          status: 'ACTIVE' as const,
          volunteer_class: 'COLLEGIATE' as const,
          engagement_track: 'CHAPTER' as const,
        })
      ).rejects.toThrow('Failed to create volunteer');
    });
  });

  describe('updateVolunteer', () => {
    it('should update and return the volunteer', async () => {
      const volunteerId = 'const-1';
      const updateData = { status: 'INACTIVE' as const };
      const updatedVolunteer = {
        volunteer_id: volunteerId,
        org_email: 'john@org.edu',
        status: 'INACTIVE',
        volunteer_class: 'COLLEGIATE',
        engagement_track: 'CHAPTER',
        major_id: 'major-1',
        education_level: 'UNDERGRADUATE',
        graduation_term_id: 'term-1',
        university_id: 'univ-1',
        home_chapter_id: 'chapter-1',
        employer_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        constituents: {
          constituent_id: 'const-1',
          first_name: 'John',
          last_name: 'Doe',
          primary_email: 'john@example.com',
          phone_number: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
      (prisma.volunteers.update as jest.Mock).mockResolvedValue(
        updatedVolunteer
      );

      const result = await updateVolunteer(volunteerId, updateData);

      expect(result).toEqual(updatedVolunteer);
    });

    it('should throw NotFoundError when updating non-existent volunteer', async () => {
      (prisma.volunteers.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateVolunteer('non-existent-id', { status: 'INACTIVE' as const })
      ).rejects.toThrow("Volunteer with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.volunteers.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateVolunteer('1', { status: 'INACTIVE' as const })
      ).rejects.toThrow('Failed to update volunteer');
    });
  });

  describe('deleteVolunteer', () => {
    it('should call delete with the correct ID and return the deleted volunteer', async () => {
      const volunteerId = 'const-1';
      const deletedVolunteer = {
        volunteer_id: volunteerId,
        org_email: 'john@org.edu',
        status: 'ACTIVE',
        volunteer_class: 'COLLEGIATE',
        engagement_track: 'CHAPTER',
        major_id: 'major-1',
        education_level: 'UNDERGRADUATE',
        graduation_term_id: 'term-1',
        university_id: 'univ-1',
        home_chapter_id: 'chapter-1',
        employer_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        constituents: {
          constituent_id: 'const-1',
          first_name: 'John',
          last_name: 'Doe',
          primary_email: 'john@example.com',
          phone_number: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
      (prisma.volunteers.delete as jest.Mock).mockResolvedValue(
        deletedVolunteer
      );

      const result = await deleteVolunteer(volunteerId);

      expect(result).toEqual(deletedVolunteer);
    });

    it('should throw NotFoundError when deleting non-existent volunteer', async () => {
      (prisma.volunteers.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteVolunteer('non-existent-id')).rejects.toThrow(
        "Volunteer with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.volunteers.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteVolunteer('1')).rejects.toThrow(
        'Failed to delete volunteer'
      );
    });
  });
});
