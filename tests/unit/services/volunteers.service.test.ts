import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { volunteer_status, volunteer_type } from '@prisma/client';

// Mock the entire prisma module
jest.mock('../../../src/config/database', () => ({
  prisma: {
    volunteers: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Volunteer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVolunteers', () => {
    it('should return an array of volunteers', async () => {
      const mockVolunteers = [
        {
          volunteer_id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          graduation_date: new Date(),
          volunteer_status: 'STUDENT',
          volunteer_type: 'BOTH',
          university_id: 'uuid-123',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.volunteers.findMany as jest.Mock).mockResolvedValue(
        mockVolunteers
      );

      const result = await getAllVolunteers();

      expect(result).toEqual(mockVolunteers);
      expect(prisma.volunteers.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getVolunteerById', () => {
    it('should return a single volunteer when a valid ID is provided', async () => {
      const volunteerId = '1';
      const mockVolunteer = {
        volunteer_id: volunteerId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        graduation_date: new Date(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: 'uuid-123',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.findUnique as jest.Mock).mockResolvedValue(
        mockVolunteer
      );

      const result = await getVolunteerById(volunteerId);

      expect(result).toEqual(mockVolunteer);
      expect(prisma.volunteers.findUnique).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
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
    it('should create and return a new volunteer', async () => {
      const inputData = {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        graduation_date: new Date('2026-06-18').toISOString(),
        volunteer_status: 'STUDENT' as volunteer_status,
        volunteer_type: 'BOTH' as volunteer_type,
        university_id: 'uuid-123',
      };
      const createdVolunteer = {
        volunteer_id: 'new-id-123',
        ...inputData,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.create as jest.Mock).mockResolvedValue(
        createdVolunteer
      );

      const result = await createVolunteer(inputData);

      expect(result).toEqual(createdVolunteer);
      expect(prisma.volunteers.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });
  });

  describe('updateVolunteer', () => {
    it('should update and return the volunteer', async () => {
      const volunteerId = '1';
      const updateData = { first_name: 'Updated Name' };
      const updatedVolunteer = {
        volunteer_id: volunteerId,
        first_name: 'Updated Name',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        graduation_date: new Date(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: 'uuid-123',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.update as jest.Mock).mockResolvedValue(
        updatedVolunteer
      );

      const result = await updateVolunteer(volunteerId, updateData);

      expect(result).toEqual(updatedVolunteer);
      expect(prisma.volunteers.update).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
        data: updateData,
      });
    });
  });

  describe('deleteVolunteer', () => {
    it('should call delete with the correct ID and return the deleted volunteer', async () => {
      const volunteerId = '1';
      const deletedVolunteer = {
        volunteer_id: volunteerId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        graduation_date: new Date(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: 'uuid-123',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.volunteers.delete as jest.Mock).mockResolvedValue(
        deletedVolunteer
      );

      const result = await deleteVolunteer(volunteerId);

      expect(result).toEqual(deletedVolunteer);
      expect(prisma.volunteers.delete).toHaveBeenCalledWith({
        where: { volunteer_id: volunteerId },
      });
    });
  });
});
