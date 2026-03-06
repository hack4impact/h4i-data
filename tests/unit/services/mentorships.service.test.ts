import {
  getAllMentorships,
  getMentorshipById,
  createMentorship,
  updateMentorship,
  deleteMentorship,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    mentorships: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Mentorship Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMentorships', () => {
    it('should return an array of mentorships', async () => {
      const mockMentorships = [
        {
          mentorship_id: '1',
          mentor_id: 'mentor-1',
          mentee_id: 'mentee-1',
          program_type: 'Technical',
          status: 'ACTIVE',
          start_date: new Date('2024-01-15'),
          end_date: null,
          notes: 'Regular check-ins scheduled',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.mentorships.findMany as jest.Mock).mockResolvedValue(
        mockMentorships
      );

      const result = await getAllMentorships();

      expect(result).toEqual(mockMentorships);
      expect(prisma.mentorships.findMany).toHaveBeenCalledWith({
        orderBy: { start_date: 'desc' },
      });
    });

    it('should return empty array when no mentorships exist', async () => {
      (prisma.mentorships.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllMentorships();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.mentorships.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllMentorships()).rejects.toThrow(
        'Failed to retrieve mentorships'
      );
    });
  });

  describe('getMentorshipById', () => {
    it('should return a single mentorship when a valid ID is provided', async () => {
      const mentorshipId = '1';
      const mockMentorship = {
        mentorship_id: mentorshipId,
        mentor_id: 'mentor-1',
        mentee_id: 'mentee-1',
        program_type: 'Technical',
        status: 'ACTIVE',
        start_date: new Date('2024-01-15'),
        end_date: null,
        notes: 'Regular check-ins scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.mentorships.findUnique as jest.Mock).mockResolvedValue(
        mockMentorship
      );

      const result = await getMentorshipById(mentorshipId);

      expect(result).toEqual(mockMentorship);
      expect(prisma.mentorships.findUnique).toHaveBeenCalledWith({
        where: { mentorship_id: mentorshipId },
      });
    });

    it('should throw NotFoundError if no mentorship is found', async () => {
      const mentorshipId = 'non-existent-id';
      (prisma.mentorships.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getMentorshipById(mentorshipId)).rejects.toThrow(
        "Mentorship with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.mentorships.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getMentorshipById('1')).rejects.toThrow(
        'Failed to retrieve mentorship'
      );
    });
  });

  describe('createMentorship', () => {
    it('should create and return a new mentorship', async () => {
      const inputData = {
        mentor_id: 'mentor-1',
        mentee_id: 'mentee-1',
        program_type: 'Career',
        status: 'PROSPECT' as const,
        start_date: new Date('2024-02-01'),
      };
      const createdMentorship = {
        mentorship_id: 'new-id-123',
        end_date: null,
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.mentorships.create as jest.Mock).mockResolvedValue(
        createdMentorship
      );

      const result = await createMentorship(inputData);

      expect(result).toEqual(createdMentorship);
      expect(prisma.mentorships.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.mentorships.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createMentorship({
          mentor_id: 'mentor-1',
          mentee_id: 'mentee-1',
          program_type: 'Career',
          status: 'PROSPECT' as const,
          start_date: new Date(),
        })
      ).rejects.toThrow('Failed to create mentorship');
    });
  });

  describe('updateMentorship', () => {
    it('should update and return the mentorship', async () => {
      const mentorshipId = '1';
      const updateData = { status: 'COMPLETED' as const };
      const updatedMentorship = {
        mentorship_id: mentorshipId,
        mentor_id: 'mentor-1',
        mentee_id: 'mentee-1',
        program_type: 'Technical',
        status: 'COMPLETED',
        start_date: new Date('2024-01-15'),
        end_date: null,
        notes: 'Regular check-ins scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.mentorships.update as jest.Mock).mockResolvedValue(
        updatedMentorship
      );

      const result = await updateMentorship(mentorshipId, updateData);

      expect(result).toEqual(updatedMentorship);
      expect(prisma.mentorships.update).toHaveBeenCalledWith({
        where: { mentorship_id: mentorshipId },
        data: updateData,
      });
    });

    it('should throw NotFoundError when updating non-existent mentorship', async () => {
      (prisma.mentorships.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateMentorship('non-existent-id', { status: 'COMPLETED' as const })
      ).rejects.toThrow("Mentorship with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.mentorships.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateMentorship('1', { status: 'COMPLETED' as const })
      ).rejects.toThrow('Failed to update mentorship');
    });
  });

  describe('deleteMentorship', () => {
    it('should call delete with the correct ID and return the deleted mentorship', async () => {
      const mentorshipId = '1';
      const deletedMentorship = {
        mentorship_id: mentorshipId,
        mentor_id: 'mentor-1',
        mentee_id: 'mentee-1',
        program_type: 'Technical',
        status: 'ACTIVE',
        start_date: new Date('2024-01-15'),
        end_date: null,
        notes: 'Regular check-ins scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.mentorships.delete as jest.Mock).mockResolvedValue(
        deletedMentorship
      );

      const result = await deleteMentorship(mentorshipId);

      expect(result).toEqual(deletedMentorship);
      expect(prisma.mentorships.delete).toHaveBeenCalledWith({
        where: { mentorship_id: mentorshipId },
      });
    });

    it('should throw NotFoundError when deleting non-existent mentorship', async () => {
      (prisma.mentorships.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteMentorship('non-existent-id')).rejects.toThrow(
        "Mentorship with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.mentorships.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteMentorship('1')).rejects.toThrow(
        'Failed to delete mentorship'
      );
    });
  });
});
