import {
  getAllConstituentLinks,
  getConstituentLinkById,
  createConstituentLink,
  updateConstituentLink,
  deleteConstituentLink,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    constituent_links: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Constituent Link Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllConstituentLinks', () => {
    it('should return an array of constituent links', async () => {
      const mockLinks = [
        {
          constituent_link_id: '1',
          constituent_id: 'const-1',
          platform: 'GITHUB',
          url: 'https://github.com/user',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.constituent_links.findMany as jest.Mock).mockResolvedValue(
        mockLinks
      );

      const result = await getAllConstituentLinks();

      expect(result).toEqual(mockLinks);
    });

    it('should return empty array when no constituent links exist', async () => {
      (prisma.constituent_links.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllConstituentLinks();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.constituent_links.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllConstituentLinks()).rejects.toThrow(
        'Failed to retrieve constituent links'
      );
    });
  });

  describe('getConstituentLinkById', () => {
    it('should return a single constituent link when a valid ID is provided', async () => {
      const linkId = '1';
      const mockLink = {
        constituent_link_id: linkId,
        constituent_id: 'const-1',
        platform: 'GITHUB',
        url: 'https://github.com/user',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.constituent_links.findUnique as jest.Mock).mockResolvedValue(
        mockLink
      );

      const result = await getConstituentLinkById(linkId);

      expect(result).toEqual(mockLink);
    });

    it('should throw NotFoundError if no constituent link is found', async () => {
      const linkId = 'non-existent-id';
      (prisma.constituent_links.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(getConstituentLinkById(linkId)).rejects.toThrow(
        "ConstituentLink with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.constituent_links.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getConstituentLinkById('1')).rejects.toThrow(
        'Failed to retrieve constituent link'
      );
    });
  });

  describe('createConstituentLink', () => {
    it('should create and return a new constituent link', async () => {
      const inputData = {
        platform: 'LINKEDIN' as const,
        url: 'https://linkedin.com/in/user',
      };
      const createdLink = {
        constituent_link_id: 'new-id-123',
        constituent_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.constituent_links.create as jest.Mock).mockResolvedValue(
        createdLink
      );

      const result = await createConstituentLink(inputData);

      expect(result).toEqual(createdLink);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.constituent_links.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createConstituentLink({
          platform: 'LINKEDIN' as const,
          url: 'https://linkedin.com/in/user',
        })
      ).rejects.toThrow('Failed to create constituent link');
    });
  });

  describe('updateConstituentLink', () => {
    it('should update and return the constituent link', async () => {
      const linkId = '1';
      const updateData = { url: 'https://github.com/updated' };
      const updatedLink = {
        constituent_link_id: linkId,
        constituent_id: 'const-1',
        platform: 'GITHUB',
        url: 'https://github.com/updated',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.constituent_links.update as jest.Mock).mockResolvedValue(
        updatedLink
      );

      const result = await updateConstituentLink(linkId, updateData);

      expect(result).toEqual(updatedLink);
    });

    it('should throw NotFoundError when updating non-existent constituent link', async () => {
      (prisma.constituent_links.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateConstituentLink('non-existent-id', {
          url: 'https://github.com/updated',
        })
      ).rejects.toThrow("ConstituentLink with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.constituent_links.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateConstituentLink('1', { url: 'https://github.com/updated' })
      ).rejects.toThrow('Failed to update constituent link');
    });
  });

  describe('deleteConstituentLink', () => {
    it('should call delete with the correct ID and return the deleted constituent link', async () => {
      const linkId = '1';
      const deletedLink = {
        constituent_link_id: linkId,
        constituent_id: 'const-1',
        platform: 'GITHUB',
        url: 'https://github.com/user',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.constituent_links.delete as jest.Mock).mockResolvedValue(
        deletedLink
      );

      const result = await deleteConstituentLink(linkId);

      expect(result).toEqual(deletedLink);
    });

    it('should throw NotFoundError when deleting non-existent constituent link', async () => {
      (prisma.constituent_links.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteConstituentLink('non-existent-id')).rejects.toThrow(
        "ConstituentLink with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.constituent_links.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteConstituentLink('1')).rejects.toThrow(
        'Failed to delete constituent link'
      );
    });
  });
});
