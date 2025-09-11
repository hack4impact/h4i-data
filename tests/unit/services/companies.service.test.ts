import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

// Mock the entire prisma module
jest.mock('../../../src/config/database', () => ({
  prisma: {
    companies: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Company Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCompanies', () => {
    it('should return an array of companies', async () => {
      const mockCompanies = [
        {
          company_id: '1',
          name: 'Test Company 1',
          founded_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.companies.findMany as jest.Mock).mockResolvedValue(mockCompanies);

      const result = await getAllCompanies();

      expect(result).toEqual(mockCompanies);
      expect(prisma.companies.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCompanyById', () => {
    it('should return a single company when a valid ID is provided', async () => {
      const companyId = '1';
      const mockCompany = {
        company_id: companyId,
        name: 'Test Company 1',
        founded_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.companies.findUnique as jest.Mock).mockResolvedValue(mockCompany);

      const result = await getCompanyById(companyId);

      expect(result).toEqual(mockCompany);
      expect(prisma.companies.findUnique).toHaveBeenCalledWith({
        where: { company_id: companyId },
      });
    });

    it('should throw NotFoundError if no company is found', async () => {
      const companyId = 'non-existent-id';
      (prisma.companies.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getCompanyById(companyId)).rejects.toThrow(
        "Company with id 'non-existent-id' not found"
      );
    });
  });

  describe('createCompany', () => {
    it('should create and return a new company', async () => {
      const inputData = {
        name: 'New Company',
        founded_date: '2025-08-30T12:00:00.000Z',
      };
      const createdCompany = {
        company_id: 'new-id-123',
        name: 'New Company',
        founded_date: new Date(inputData.founded_date),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.companies.create as jest.Mock).mockResolvedValue(createdCompany);

      const result = await createCompany(inputData);

      expect(result).toEqual(createdCompany);
      expect(prisma.companies.create).toHaveBeenCalledWith({ data: inputData });
    });
  });

  describe('updateCompany', () => {
    it('should update and return the company', async () => {
      const companyId = '1';
      const updateData = { name: 'Updated Company Name' };
      const updatedCompany = {
        company_id: companyId,
        name: 'Updated Company Name',
        founded_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.companies.update as jest.Mock).mockResolvedValue(updatedCompany);

      const result = await updateCompany(companyId, updateData);

      expect(result).toEqual(updatedCompany);
      expect(prisma.companies.update).toHaveBeenCalledWith({
        where: { company_id: companyId },
        data: updateData,
      });
    });
  });

  describe('deleteCompany', () => {
    it('should call delete with the correct ID and return the deleted company', async () => {
      const companyId = '1';
      const deletedCompany = {
        company_id: companyId,
        name: 'Deleted Company',
        founded_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.companies.delete as jest.Mock).mockResolvedValue(deletedCompany);

      const result = await deleteCompany(companyId);

      expect(result).toEqual(deletedCompany);
      expect(prisma.companies.delete).toHaveBeenCalledWith({
        where: { company_id: companyId },
      });
    });
  });
});
