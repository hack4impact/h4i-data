import {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    mentors: {
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

describe('Mentor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMentors', () => {
    it('should return an array of mentors with constituents', async () => {
      const mockMentors = [
        {
          mentor_id: 'const-1',
          status: 'ACTIVE',
          expertise_area: 'Web Development',
          max_mentees: 3,
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
      (prisma.mentors.findMany as jest.Mock).mockResolvedValue(mockMentors);

      const result = await getAllMentors();

      expect(result).toEqual(mockMentors);
      expect(prisma.mentors.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
        include: { constituents: true },
      });
    });

    it('should return empty array when no mentors exist', async () => {
      (prisma.mentors.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllMentors();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.mentors.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllMentors()).rejects.toThrow(
        'Failed to retrieve mentors'
      );
    });
  });

  describe('getMentorById', () => {
    it('should return a single mentor with constituent when a valid ID is provided', async () => {
      const mentorId = 'const-1';
      const mockMentor = {
        mentor_id: mentorId,
        status: 'ACTIVE',
        expertise_area: 'Web Development',
        max_mentees: 3,
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
      (prisma.mentors.findUnique as jest.Mock).mockResolvedValue(mockMentor);

      const result = await getMentorById(mentorId);

      expect(result).toEqual(mockMentor);
      expect(prisma.mentors.findUnique).toHaveBeenCalledWith({
        where: { mentor_id: mentorId },
        include: { constituents: true },
      });
    });

    it('should throw NotFoundError if no mentor is found', async () => {
      const mentorId = 'non-existent-id';
      (prisma.mentors.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getMentorById(mentorId)).rejects.toThrow(
        "Mentor with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.mentors.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getMentorById('1')).rejects.toThrow(
        'Failed to retrieve mentor'
      );
    });
  });

  describe('createMentor', () => {
    it('should create and return a new mentor with constituent check', async () => {
      const constituentId = 'const-2';
      const inputData = {
        mentor_id: constituentId,
        status: 'ACTIVE' as const,
        expertise_area: 'Data Science',
        max_mentees: 5,
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

      const createdMentor = {
        ...inputData,
        created_at: new Date(),
        updated_at: new Date(),
        constituents: mockConstituent,
      };

      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue(
        mockConstituent
      );
      (prisma.mentors.create as jest.Mock).mockResolvedValue(createdMentor);

      const result = await createMentor(inputData);

      expect(result).toEqual(createdMentor);
      expect(prisma.constituents.findUnique).toHaveBeenCalledWith({
        where: { constituent_id: constituentId },
      });
      expect(prisma.mentors.create).toHaveBeenCalledWith({
        data: inputData,
        include: { constituents: true },
      });
    });

    it('should throw NotFoundError if constituent does not exist', async () => {
      const inputData = {
        mentor_id: 'non-existent-const',
        status: 'ACTIVE' as const,
      };

      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createMentor(inputData)).rejects.toThrow(
        "Constituent with id 'non-existent-const' not found"
      );
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue({
        constituent_id: 'const-1',
      });
      (prisma.mentors.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createMentor({
          mentor_id: 'const-1',
          status: 'ACTIVE' as const,
        })
      ).rejects.toThrow('Failed to create mentor');
    });
  });

  describe('updateMentor', () => {
    it('should update and return the mentor', async () => {
      const mentorId = 'const-1';
      const updateData = { status: 'INACTIVE' as const };
      const updatedMentor = {
        mentor_id: mentorId,
        status: 'INACTIVE',
        expertise_area: 'Web Development',
        max_mentees: 3,
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
      (prisma.mentors.update as jest.Mock).mockResolvedValue(updatedMentor);

      const result = await updateMentor(mentorId, updateData);

      expect(result).toEqual(updatedMentor);
      expect(prisma.mentors.update).toHaveBeenCalledWith({
        where: { mentor_id: mentorId },
        data: updateData,
        include: { constituents: true },
      });
    });

    it('should throw NotFoundError when updating non-existent mentor', async () => {
      (prisma.mentors.update as jest.Mock).mockRejectedValue(
        new Error('Record to update not found')
      );
      await expect(
        updateMentor('non-existent-id', { status: 'INACTIVE' as const })
      ).rejects.toThrow("Mentor with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.mentors.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateMentor('1', { status: 'INACTIVE' as const })
      ).rejects.toThrow('Failed to update mentor');
    });
  });

  describe('deleteMentor', () => {
    it('should call delete with the correct ID and return the deleted mentor', async () => {
      const mentorId = 'const-1';
      const deletedMentor = {
        mentor_id: mentorId,
        status: 'ACTIVE',
        expertise_area: 'Web Development',
        max_mentees: 3,
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
      (prisma.mentors.delete as jest.Mock).mockResolvedValue(deletedMentor);

      const result = await deleteMentor(mentorId);

      expect(result).toEqual(deletedMentor);
      expect(prisma.mentors.delete).toHaveBeenCalledWith({
        where: { mentor_id: mentorId },
        include: { constituents: true },
      });
    });

    it('should throw NotFoundError when deleting non-existent mentor', async () => {
      (prisma.mentors.delete as jest.Mock).mockRejectedValue(
        new Error('Record to delete does not exist')
      );
      await expect(deleteMentor('non-existent-id')).rejects.toThrow(
        "Mentor with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.mentors.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteMentor('1')).rejects.toThrow(
        'Failed to delete mentor'
      );
    });
  });
});
