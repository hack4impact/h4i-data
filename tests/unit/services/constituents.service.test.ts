import {
  getAllConstituents,
  getConstituentById,
  createConstituent,
  updateConstituent,
  deleteConstituent,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    constituents: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Constituent Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllConstituents', () => {
    it('should return an array of constituents', async () => {
      const mockConstituents = [
        {
          constituent_id: '1',
          first_name: 'John',
          last_name: 'Doe',
          primary_email: 'john@example.com',
          phone_number: '555-1234',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.constituents.findMany as jest.Mock).mockResolvedValue(
        mockConstituents
      );

      const result = await getAllConstituents();

      expect(result).toEqual(mockConstituents);
    });

    it('should return empty array when no constituents exist', async () => {
      (prisma.constituents.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAllConstituents();

      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.constituents.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getAllConstituents()).rejects.toThrow(
        'Failed to retrieve constituents'
      );
    });
  });

  describe('getConstituentById', () => {
    it('should return a single constituent when a valid ID is provided', async () => {
      const constituentId = '1';
      const mockConstituent = {
        constituent_id: constituentId,
        first_name: 'John',
        last_name: 'Doe',
        primary_email: 'john@example.com',
        phone_number: '555-1234',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue(
        mockConstituent
      );

      const result = await getConstituentById(constituentId);

      expect(result).toEqual(mockConstituent);
    });

    it('should throw NotFoundError if no constituent is found', async () => {
      const constituentId = 'non-existent-id';
      (prisma.constituents.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getConstituentById(constituentId)).rejects.toThrow(
        "Constituent with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.constituents.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getConstituentById('1')).rejects.toThrow(
        'Failed to retrieve constituent'
      );
    });
  });

  describe('createConstituent', () => {
    it('should create and return a new constituent', async () => {
      const inputData = {
        first_name: 'Jane',
        last_name: 'Smith',
        primary_email: 'jane@example.com',
      };
      const createdConstituent = {
        constituent_id: 'new-id-123',
        ...inputData,
        phone_number: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.constituents.create as jest.Mock).mockResolvedValue(
        createdConstituent
      );

      const result = await createConstituent(inputData);

      expect(result).toEqual(createdConstituent);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.constituents.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(
        createConstituent({
          first_name: 'Jane',
          last_name: 'Smith',
          primary_email: 'jane@example.com',
        })
      ).rejects.toThrow('Failed to create constituent');
    });
  });

  describe('updateConstituent', () => {
    it('should update and return the constituent', async () => {
      const constituentId = '1';
      const updateData = { first_name: 'Updated Name' };
      const updatedConstituent = {
        constituent_id: constituentId,
        first_name: 'Updated Name',
        last_name: 'Doe',
        primary_email: 'john@example.com',
        phone_number: '555-1234',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.constituents.update as jest.Mock).mockResolvedValue(
        updatedConstituent
      );

      const result = await updateConstituent(constituentId, updateData);

      expect(result).toEqual(updatedConstituent);
    });

    it('should throw NotFoundError when updating non-existent constituent', async () => {
      (prisma.constituents.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(
        updateConstituent('non-existent-id', { first_name: 'Updated' })
      ).rejects.toThrow("Constituent with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.constituents.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(
        updateConstituent('1', { first_name: 'Updated' })
      ).rejects.toThrow('Failed to update constituent');
    });
  });

  describe('deleteConstituent', () => {
    it('should call delete with the correct ID and return the deleted constituent', async () => {
      const constituentId = '1';
      const deletedConstituent = {
        constituent_id: constituentId,
        first_name: 'John',
        last_name: 'Doe',
        primary_email: 'john@example.com',
        phone_number: '555-1234',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.constituents.delete as jest.Mock).mockResolvedValue(
        deletedConstituent
      );

      const result = await deleteConstituent(constituentId);

      expect(result).toEqual(deletedConstituent);
    });

    it('should throw NotFoundError when deleting non-existent constituent', async () => {
      (prisma.constituents.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(deleteConstituent('non-existent-id')).rejects.toThrow(
        "Constituent with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.constituents.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(deleteConstituent('1')).rejects.toThrow(
        'Failed to delete constituent'
      );
    });
  });
});
