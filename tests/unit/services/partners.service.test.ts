import {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
        },
      ];
      (prisma.partners.findMany as jest.Mock).mockResolvedValue(mockPartners);

      const result = await getAllPartners();

      expect(result).toEqual(mockPartners);
      expect(prisma.partners.findMany).toHaveBeenCalledTimes(1);
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
      };
      (prisma.partners.findUnique as jest.Mock).mockResolvedValue(mockPartner);

      const result = await getPartnerById(partnerId);

      expect(result).toEqual(mockPartner);
      expect(prisma.partners.findUnique).toHaveBeenCalledWith({
        where: { partner_id: partnerId },
      });
    });

    it('should throw NotFoundError if no partner is found', async () => {
      const partnerId = 'non-existent-id';
      (prisma.partners.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getPartnerById(partnerId)).rejects.toThrow(
        "Partner with id 'non-existent-id' not found"
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
      };
      (prisma.partners.create as jest.Mock).mockResolvedValue(createdPartner);

      const result = await createPartner(inputData);

      expect(result).toEqual(createdPartner);
      expect(prisma.partners.create).toHaveBeenCalledWith({ data: inputData });
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
      };
      (prisma.partners.update as jest.Mock).mockResolvedValue(updatedPartner);

      const result = await updatePartner(partnerId, updateData);

      expect(result).toEqual(updatedPartner);
      expect(prisma.partners.update).toHaveBeenCalledWith({
        where: { partner_id: partnerId },
        data: updateData,
      });
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
      };
      (prisma.partners.delete as jest.Mock).mockResolvedValue(deletedPartner);

      const result = await deletePartner(partnerId);

      expect(result).toEqual(deletedPartner);
      expect(prisma.partners.delete).toHaveBeenCalledWith({
        where: { partner_id: partnerId },
      });
    });
  });
});
