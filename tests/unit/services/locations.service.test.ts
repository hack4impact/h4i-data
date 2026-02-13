import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
      expect(prisma.locations.findMany).toHaveBeenCalledTimes(1);
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
  });
});
