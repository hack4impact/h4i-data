import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
          engagement_track: 'PROGRAMS',
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
      expect(prisma.volunteers.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
        include: { constituents: true },
      });
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
        engagement_track: 'PROGRAMS',
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
      expect(prisma.volunteers.findUnique).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
        include: { constituents: true },
      });
    });

    it('should throw NotFoundError if no volunteer is found', async () => {
      const volunteerId = 'non-existent-id';
      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getVolunteerById(volunteerId)).rejects.toThrow(
        "Volunteer with id 'non-existent-id' not found"
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
        engagement_track: 'PROGRAMS' as const,
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
      expect(prisma.constituents.findUnique).toHaveBeenCalledWith({
        where: { constituent_id: constituentId },
      });
      expect(prisma.volunteers.create).toHaveBeenCalledWith({
        data: inputData,
        include: { constituents: true },
      });
    });

    it('should throw NotFoundError if constituent does not exist', async () => {
      const inputData = {
        volunteer_id: 'non-existent-const',
        org_email: 'test@org.edu',
        status: 'ACTIVE' as const,
        volunteer_class: 'COLLEGIATE' as const,
        engagement_track: 'PROGRAMS' as const,
      };

      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createVolunteer(inputData)).rejects.toThrow(
        "Constituent with id 'non-existent-const' not found"
      );
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
        engagement_track: 'PROGRAMS',
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
      expect(prisma.volunteers.update).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
        data: updateData,
        include: { constituents: true },
      });
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
        engagement_track: 'PROGRAMS',
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
      expect(prisma.volunteers.delete).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
        include: { constituents: true },
      });
    });
  });
});
