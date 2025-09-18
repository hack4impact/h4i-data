import {
  getAllSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

// Mock the entire prisma module
jest.mock('../../../src/config/database', () => ({
  prisma: {
    sponsors: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Sponsor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSponsors', () => {
    it('should return an array of sponsors', async () => {
      const mockSponsors = [
        {
          sponsor_id: '1',
          name: 'Test Sponsor 1',
          contact_id: 'contact-123',
          founded_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.sponsors.findMany as jest.Mock).mockResolvedValue(mockSponsors);

      const result = await getAllSponsors();

      expect(result).toEqual(mockSponsors);
      expect(prisma.sponsors.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSponsorById', () => {
    it('should return a single sponsor when a valid ID is provided', async () => {
      const sponsorId = '1';
      const mockSponsor = {
        sponsor_id: sponsorId,
        name: 'Test Sponsor 1',
        contact_id: 'contact-123',
        founded_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.sponsors.findUnique as jest.Mock).mockResolvedValue(mockSponsor);

      const result = await getSponsorById(sponsorId);

      expect(result).toEqual(mockSponsor);
      expect(prisma.sponsors.findUnique).toHaveBeenCalledWith({
        where: { sponsor_id: sponsorId },
      });
    });

    it('should throw NotFoundError if no sponsor is found', async () => {
      const sponsorId = 'non-existent-id';
      (prisma.sponsors.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getSponsorById(sponsorId)).rejects.toThrow(
        "Sponsor with id 'non-existent-id' not found"
      );
    });
  });

  describe('createSponsor', () => {
    it('should create and return a new sponsor', async () => {
      const inputData = {
        name: 'New Sponsor',
        contact_id: 'contact-123',
        founded_date: '2025-08-30T12:00:00.000Z',
      };
      const createdSponsor = {
        sponsor_id: 'new-id-123',
        name: 'New Sponsor',
        contact_id: 'contact-123',
        founded_date: new Date(inputData.founded_date),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.sponsors.create as jest.Mock).mockResolvedValue(createdSponsor);

      const result = await createSponsor(inputData);

      expect(result).toEqual(createdSponsor);
      expect(prisma.sponsors.create).toHaveBeenCalledWith({ data: inputData });
    });
  });

  describe('updateSponsor', () => {
    it('should update and return the sponsor', async () => {
      const sponsorId = '1';
      const updateData = { name: 'Updated Sponsor Name' };
      const updatedSponsor = {
        sponsor_id: sponsorId,
        name: 'Updated Sponsor Name',
        contact_id: 'contact-123',
        founded_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.sponsors.update as jest.Mock).mockResolvedValue(updatedSponsor);

      const result = await updateSponsor(sponsorId, updateData);

      expect(result).toEqual(updatedSponsor);
      expect(prisma.sponsors.update).toHaveBeenCalledWith({
        where: { sponsor_id: sponsorId },
        data: updateData,
      });
    });
  });

  describe('deleteSponsor', () => {
    it('should call delete with the correct ID and return the deleted sponsor', async () => {
      const sponsorId = '1';
      const deletedSponsor = {
        sponsor_id: sponsorId,
        name: 'Deleted Sponsor',
        contact_id: 'contact-123',
        founded_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.sponsors.delete as jest.Mock).mockResolvedValue(deletedSponsor);

      const result = await deleteSponsor(sponsorId);

      expect(result).toEqual(deletedSponsor);
      expect(prisma.sponsors.delete).toHaveBeenCalledWith({
        where: { sponsor_id: sponsorId },
      });
    });
  });
});
