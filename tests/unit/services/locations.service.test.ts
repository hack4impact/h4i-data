import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    locations: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Location Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLocations', () => {
    it('should return an array of locations', async () => {
      const mockLocations = [
        {
          location_id: '1',
          name: 'Test Location 1',
          address_line: '123 Test Street',
          state_code: 'CA',
          country_code: 'USA',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.locations.findMany as jest.Mock).mockResolvedValue(mockLocations);

      const result = await getAllLocations();

      expect(result).toEqual(mockLocations);
      expect(prisma.locations.findMany).toHaveBeenCalledWith();
    });

    it('should return empty array when no locations exist', async () => {
      (prisma.locations.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAllLocations();

      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.locations.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getAllLocations()).rejects.toThrow(
        'Failed to fetch locations'
      );
    });
  });

  describe('getLocationById', () => {
    it('should return a single location when a valid ID is provided', async () => {
      const locationId = '1';
      const mockLocation = {
        location_id: '1',
        name: 'Test Location 1',
        address_line: '123 Test Street',
        state_code: 'CA',
        country_code: 'USA',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.locations.findUnique as jest.Mock).mockResolvedValue(
        mockLocation
      );

      const result = await getLocationById(locationId);

      expect(result).toEqual(mockLocation);
      expect(prisma.locations.findUnique).toHaveBeenCalledWith({
        where: { location_id: locationId },
      });
    });

    it('should throw NotFoundError if no location is found', async () => {
      (prisma.locations.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getLocationById('non-existent-id')).rejects.toThrow(
        "Location with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.locations.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getLocationById('1')).rejects.toThrow(
        'Failed to fetch location'
      );
    });
  });

  describe('createLocation', () => {
    it('should create and return a new location', async () => {
      const inputData = {
        name: 'Test Location 1',
        address_line: '123 Test Street',
        state_code: 'CA',
        country_code: 'USA',
      };

      const createdLocation = {
        location_id: '1',
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };

      (prisma.locations.create as jest.Mock).mockResolvedValue(createdLocation);

      const result = await createLocation(inputData);

      expect(result).toEqual(createdLocation);

      expect(prisma.locations.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: inputData.name,
          address_line: inputData.address_line,
          state_code: inputData.state_code,
          country_code: inputData.country_code,
        }),
      });
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.locations.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(
        createLocation({ name: 'Test', state_code: 'CA', country_code: 'USA' })
      ).rejects.toThrow('Failed to create location');
    });
  });

  describe('updateLocation', () => {
    it('should update and return the location', async () => {
      const locationId = '1';
      const updateData = { name: 'Updated Location Name' };

      const updatedLocation = {
        location_id: '1',
        name: 'Updated Location Name',
        address_line: '123 Test Street',
        state_code: 'CA',
        country_code: 'USA',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.locations.update as jest.Mock).mockResolvedValue(updatedLocation);

      const result = await updateLocation(locationId, updateData);

      expect(result).toEqual(updatedLocation);
      expect(prisma.locations.update).toHaveBeenCalledWith({
        where: { location_id: locationId },
        data: updateData,
      });
    });

    it('should throw NotFoundError when updating non-existent location', async () => {
      (prisma.locations.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(
        updateLocation('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow("Location with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.locations.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(updateLocation('1', { name: 'Updated' })).rejects.toThrow(
        'Failed to update location'
      );
    });
  });

  describe('deleteLocation', () => {
    it('should call delete with the correct ID and return the deleted location', async () => {
      const locationId = '1';
      const deletedLocation = {
        location_id: locationId,
        name: 'Test Location 1',
        address_line: '123 Test Street',
        state_code: 'CA',
        country_code: 'USA',
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.locations.delete as jest.Mock).mockResolvedValue(deletedLocation);

      const result = await deleteLocation(locationId);

      expect(result).toEqual(deletedLocation);
      expect(prisma.locations.delete).toHaveBeenCalledWith({
        where: { location_id: locationId },
      });
    });

    it('should throw NotFoundError when deleting non-existent location', async () => {
      (prisma.locations.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(deleteLocation('non-existent-id')).rejects.toThrow(
        "Location with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.locations.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(deleteLocation('1')).rejects.toThrow(
        'Failed to delete location'
      );
    });
  });
});
