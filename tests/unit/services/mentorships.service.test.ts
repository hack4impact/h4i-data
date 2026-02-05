import {
  getAllMentorships,
  getMentorshipById,
  createMentorship,
  updateMentorship,
  deleteMentorship,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
        },
      ];
      (prisma.mentorships.findMany as jest.Mock).mockResolvedValue(
        mockMentorships
      );

      const result = await getAllMentorships();

      expect(result).toEqual(mockMentorships);
      expect(prisma.mentorships.findMany).toHaveBeenCalledTimes(1);
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
  });
});
