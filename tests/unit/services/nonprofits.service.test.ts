import {
  getAllNonprofits,
  getNonprofitById,
  createNonprofit,
  updateNonprofit,
  deleteNonprofit,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

// Mock prisma client
jest.mock('../../../src/config/database', () => ({
  prisma: {
    nonprofits: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Nonprofit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNonprofits', () => {
    it('should return an array of nonprofits', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Test Nonprofit 1',
          mission: 'A test nonprofit',
          website: 'A test repo link',
          location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
          contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getAllNonprofits();

      expect(result).toEqual(mockNonprofits);
      expect(prisma.nonprofits.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.nonprofits.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('getNonprofitById', () => {
    it('should return a single nonprofit when a valid ID is provided', async () => {
      const nonprofitId = '1';
      const mockNonprofit = {
        nonprofit_id: '1',
        name: 'Test Nonprofit 1',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.nonprofits.findUnique as jest.Mock).mockResolvedValue(
        mockNonprofit
      );

      const result = await getNonprofitById(nonprofitId);

      expect(result).toEqual(mockNonprofit);
      expect(prisma.nonprofits.findUnique).toHaveBeenCalledWith({
        where: { nonprofit_id: nonprofitId },
      });
    });

    it('should throw NotFoundError if no nonprofit is found', async () => {
      const nonprofitId = 'non-existent-id';
      (prisma.nonprofits.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getNonprofitById(nonprofitId)).rejects.toThrow(
        "Nonprofit with id 'non-existent-id' not found"
      );
    });
  });

  describe('createNonprofit', () => {
    it('should create and return a new nonprofit', async () => {
      const inputData = {
        name: 'Test Nonprofit 1',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
      };

      const createdNonprofit = {
        nonprofit_id: '1',
        ...inputData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.nonprofits.create as jest.Mock).mockResolvedValue(
        createdNonprofit
      );

      const result = await createNonprofit(inputData);

      expect(result).toEqual(createdNonprofit);

      expect(prisma.nonprofits.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: inputData.name,
          mission: inputData.mission,
          contact_id: inputData.contact_id,
          website: inputData.website,
          location_id: inputData.location_id,
        }),
      });
    });
  });

  describe('updateNonprofit', () => {
    it('should update and return the nonprofit', async () => {
      const nonprofitId = '1';
      const updateData = { name: 'Updated Nonprofit Name' };

      const updatedNonprofit = {
        nonprofit_id: '1',
        name: 'Updated Nonprofit Name',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.nonprofits.update as jest.Mock).mockResolvedValue(
        updatedNonprofit
      );

      const result = await updateNonprofit(nonprofitId, updateData);

      expect(result).toEqual(updatedNonprofit);
      expect(prisma.nonprofits.update).toHaveBeenCalledWith({
        where: { nonprofit_id: nonprofitId },
        data: updateData,
      });
    });
  });

  describe('deleteNonprofit', () => {
    it('should call delete with the correct ID and return the deleted nonprofit', async () => {
      const nonprofitId = '1';
      const deletedNonprofit = {
        nonprofit_id: nonprofitId,
        name: 'Test Nonprofit 1',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.nonprofits.delete as jest.Mock).mockResolvedValue(
        deletedNonprofit
      );

      const result = await deleteNonprofit(nonprofitId);

      expect(result).toEqual(deletedNonprofit);
      expect(prisma.nonprofits.delete).toHaveBeenCalledWith({
        where: { nonprofit_id: nonprofitId },
      });
    });
  });
});
