import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

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
    });

    it('should return empty array when no companies exist', async () => {
      (prisma.companies.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAllCompanies();

      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.companies.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getAllCompanies()).rejects.toThrow(
        'Failed to retrieve companies'
      );
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
    });

    it('should throw NotFoundError if no company is found', async () => {
      const companyId = 'non-existent-id';
      (prisma.companies.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getCompanyById(companyId)).rejects.toThrow(
        "Company with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.companies.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(getCompanyById('1')).rejects.toThrow(
        'Failed to retrieve company'
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
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.companies.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(createCompany({ name: 'New Company' })).rejects.toThrow(
        'Failed to create company'
      );
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
    });

    it('should throw NotFoundError when updating non-existent company', async () => {
      (prisma.companies.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(
        updateCompany('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow("Company with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.companies.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(updateCompany('1', { name: 'Updated' })).rejects.toThrow(
        'Failed to update company'
      );
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
    });

    it('should throw NotFoundError when deleting non-existent company', async () => {
      (prisma.companies.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );

      await expect(deleteCompany('non-existent-id')).rejects.toThrow(
        "Company with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.companies.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(deleteCompany('1')).rejects.toThrow(
        'Failed to delete company'
      );
    });
  });
});
