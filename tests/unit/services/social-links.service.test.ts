import {
  getAllSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    social_links: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Social Link Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSocialLinks', () => {
    it('should return an array of social links', async () => {
      const mockLinks = [
        {
          link_id: '1',
          constituent_id: 'const-1',
          platform: 'GITHUB',
          url: 'https://github.com/user',
          is_featured: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.social_links.findMany as jest.Mock).mockResolvedValue(mockLinks);

      const result = await getAllSocialLinks();

      expect(result).toEqual(mockLinks);
    });

    it('should return empty array when no social links exist', async () => {
      (prisma.social_links.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllSocialLinks();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.social_links.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllSocialLinks()).rejects.toThrow(
        'Failed to retrieve social links'
      );
    });
  });

  describe('getSocialLinkById', () => {
    it('should return a single social link when a valid ID is provided', async () => {
      const linkId = '1';
      const mockLink = {
        link_id: linkId,
        constituent_id: 'const-1',
        platform: 'GITHUB',
        url: 'https://github.com/user',
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.social_links.findUnique as jest.Mock).mockResolvedValue(mockLink);

      const result = await getSocialLinkById(linkId);

      expect(result).toEqual(mockLink);
    });

    it('should throw NotFoundError if no social link is found', async () => {
      const linkId = 'non-existent-id';
      (prisma.social_links.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getSocialLinkById(linkId)).rejects.toThrow(
        "SocialLink with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.social_links.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getSocialLinkById('1')).rejects.toThrow(
        'Failed to retrieve social link'
      );
    });
  });

  describe('createSocialLink', () => {
    it('should create and return a new social link', async () => {
      const inputData = {
        platform: 'LINKEDIN' as const,
        url: 'https://linkedin.com/in/user',
        is_featured: false,
      };
      const createdLink = {
        link_id: 'new-id-123',
        constituent_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.social_links.create as jest.Mock).mockResolvedValue(createdLink);

      const result = await createSocialLink(inputData);

      expect(result).toEqual(createdLink);
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.social_links.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createSocialLink({
          platform: 'LINKEDIN' as const,
          url: 'https://linkedin.com/in/user',
          is_featured: false,
        })
      ).rejects.toThrow('Failed to create social link');
    });
  });

  describe('updateSocialLink', () => {
    it('should update and return the social link', async () => {
      const linkId = '1';
      const updateData = { is_featured: false };
      const updatedLink = {
        link_id: linkId,
        constituent_id: 'const-1',
        platform: 'GITHUB',
        url: 'https://github.com/user',
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.social_links.update as jest.Mock).mockResolvedValue(updatedLink);

      const result = await updateSocialLink(linkId, updateData);

      expect(result).toEqual(updatedLink);
    });

    it('should throw NotFoundError when updating non-existent social link', async () => {
      (prisma.social_links.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateSocialLink('non-existent-id', { is_featured: false })
      ).rejects.toThrow("SocialLink with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.social_links.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateSocialLink('1', { is_featured: false })
      ).rejects.toThrow('Failed to update social link');
    });
  });

  describe('deleteSocialLink', () => {
    it('should call delete with the correct ID and return the deleted social link', async () => {
      const linkId = '1';
      const deletedLink = {
        link_id: linkId,
        constituent_id: 'const-1',
        platform: 'GITHUB',
        url: 'https://github.com/user',
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.social_links.delete as jest.Mock).mockResolvedValue(deletedLink);

      const result = await deleteSocialLink(linkId);

      expect(result).toEqual(deletedLink);
    });

    it('should throw NotFoundError when deleting non-existent social link', async () => {
      (prisma.social_links.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteSocialLink('non-existent-id')).rejects.toThrow(
        "SocialLink with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.social_links.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteSocialLink('1')).rejects.toThrow(
        'Failed to delete social link'
      );
    });
  });
});
