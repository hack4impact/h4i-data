import {
  getAllSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
      expect(prisma.social_links.findMany).toHaveBeenCalledTimes(1);
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
      expect(prisma.social_links.findUnique).toHaveBeenCalledWith({
        where: { link_id: linkId },
      });
    });

    it('should throw NotFoundError if no social link is found', async () => {
      const linkId = 'non-existent-id';
      (prisma.social_links.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getSocialLinkById(linkId)).rejects.toThrow(
        "SocialLink with id 'non-existent-id' not found"
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
      expect(prisma.social_links.create).toHaveBeenCalledWith({
        data: inputData,
      });
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
      expect(prisma.social_links.update).toHaveBeenCalledWith({
        where: { link_id: linkId },
        data: updateData,
      });
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
      expect(prisma.social_links.delete).toHaveBeenCalledWith({
        where: { link_id: linkId },
      });
    });
  });
});
