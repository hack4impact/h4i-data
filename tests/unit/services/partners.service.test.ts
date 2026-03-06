import {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    partners: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Partner Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPartners', () => {
    it('should return an array of partners', async () => {
      const mockPartners = [
        {
          partner_id: '1',
          legal_name: 'Test Organization',
          mission_statement: 'Test mission',
          website_url: 'https://example.com',
          pcs_organization_type: 'Nonprofit',
          pcs_subject: 'Education',
          pcs_population: 'Youth',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.partners.findMany as jest.Mock).mockResolvedValue(mockPartners);

      const result = await getAllPartners();

      expect(result).toEqual(mockPartners);
    });

    it('should return empty array when no partners exist', async () => {
      (prisma.partners.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAllPartners();

      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.partners.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getAllPartners()).rejects.toThrow(
        'Failed to retrieve partners'
      );
    });
  });

  describe('getPartnerById', () => {
    it('should return a single partner when a valid ID is provided', async () => {
      const partnerId = '1';
      const mockPartner = {
        partner_id: partnerId,
        legal_name: 'Test Organization',
        mission_statement: 'Test mission',
        website_url: 'https://example.com',
        pcs_organization_type: 'Nonprofit',
        pcs_subject: 'Education',
        pcs_population: 'Youth',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.partners.findUnique as jest.Mock).mockResolvedValue(mockPartner);

      const result = await getPartnerById(partnerId);

      expect(result).toEqual(mockPartner);
    });

    it('should throw NotFoundError if no partner is found', async () => {
      const partnerId = 'non-existent-id';
      (prisma.partners.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getPartnerById(partnerId)).rejects.toThrow(
        "Partner with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.partners.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getPartnerById('1')).rejects.toThrow(
        'Failed to retrieve partner'
      );
    });
  });

  describe('createPartner', () => {
    it('should create and return a new partner', async () => {
      const inputData = {
        legal_name: 'New Organization',
        mission_statement: 'New mission',
        website_url: 'https://new.com',
      };
      const createdPartner = {
        partner_id: 'new-id-123',
        ...inputData,
        pcs_organization_type: null,
        pcs_subject: null,
        pcs_population: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.partners.create as jest.Mock).mockResolvedValue(createdPartner);

      const result = await createPartner(inputData);

      expect(result).toEqual(createdPartner);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.partners.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(
        createPartner({ legal_name: 'New Organization' })
      ).rejects.toThrow('Failed to create partner');
    });
  });

  describe('updatePartner', () => {
    it('should update and return the partner', async () => {
      const partnerId = '1';
      const updateData = { legal_name: 'Updated Organization' };
      const updatedPartner = {
        partner_id: partnerId,
        legal_name: 'Updated Organization',
        mission_statement: 'Test mission',
        website_url: 'https://example.com',
        pcs_organization_type: 'Nonprofit',
        pcs_subject: 'Education',
        pcs_population: 'Youth',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.partners.update as jest.Mock).mockResolvedValue(updatedPartner);

      const result = await updatePartner(partnerId, updateData);

      expect(result).toEqual(updatedPartner);
    });

    it('should throw NotFoundError when updating non-existent partner', async () => {
      (prisma.partners.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(
        updatePartner('non-existent-id', { legal_name: 'Updated' })
      ).rejects.toThrow("Partner with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.partners.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(
        updatePartner('1', { legal_name: 'Updated' })
      ).rejects.toThrow('Failed to update partner');
    });
  });

  describe('deletePartner', () => {
    it('should call delete with the correct ID and return the deleted partner', async () => {
      const partnerId = '1';
      const deletedPartner = {
        partner_id: partnerId,
        legal_name: 'Test Organization',
        mission_statement: 'Test mission',
        website_url: 'https://example.com',
        pcs_organization_type: 'Nonprofit',
        pcs_subject: 'Education',
        pcs_population: 'Youth',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.partners.delete as jest.Mock).mockResolvedValue(deletedPartner);

      const result = await deletePartner(partnerId);

      expect(result).toEqual(deletedPartner);
    });

    it('should throw NotFoundError when deleting non-existent partner', async () => {
      (prisma.partners.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(deletePartner('non-existent-id')).rejects.toThrow(
        "Partner with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.partners.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(deletePartner('1')).rejects.toThrow(
        'Failed to delete partner'
      );
    });
  });
});
