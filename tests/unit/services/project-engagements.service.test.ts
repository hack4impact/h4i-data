import {
  getAllProjectEngagements,
  getProjectEngagementById,
  createProjectEngagement,
  updateProjectEngagement,
  deleteProjectEngagement,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';
import { Prisma } from '@prisma/client';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    project_engagements: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Project Engagement Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjectEngagements', () => {
    it('should return an array of project engagements', async () => {
      const mockEngagements = [
        {
          engagement_id: '1',
          project_id: 'proj-1',
          partner_id: 'partner-1',
          chapter_id: 'chapter-1',
          academic_term_id: 'term-1',
          client_contact_id: 'contact-1',
          status: 'ACTIVE',
          domain: 'FULL_STACK',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.project_engagements.findMany as jest.Mock).mockResolvedValue(
        mockEngagements
      );

      const result = await getAllProjectEngagements();

      expect(result).toEqual(mockEngagements);
      expect(prisma.project_engagements.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return empty array when no project engagements exist', async () => {
      (prisma.project_engagements.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllProjectEngagements();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.project_engagements.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllProjectEngagements()).rejects.toThrow(
        'Failed to retrieve project engagements'
      );
    });
  });

  describe('getProjectEngagementById', () => {
    it('should return a single project engagement when a valid ID is provided', async () => {
      const engagementId = '1';
      const mockEngagement = {
        engagement_id: engagementId,
        project_id: 'proj-1',
        partner_id: 'partner-1',
        chapter_id: 'chapter-1',
        academic_term_id: 'term-1',
        client_contact_id: 'contact-1',
        status: 'ACTIVE',
        domain: 'FULL_STACK',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_engagements.findUnique as jest.Mock).mockResolvedValue(
        mockEngagement
      );

      const result = await getProjectEngagementById(engagementId);

      expect(result).toEqual(mockEngagement);
      expect(prisma.project_engagements.findUnique).toHaveBeenCalledWith({
        where: { engagement_id: engagementId },
      });
    });

    it('should throw NotFoundError if no project engagement is found', async () => {
      const engagementId = 'non-existent-id';
      (prisma.project_engagements.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(getProjectEngagementById(engagementId)).rejects.toThrow(
        "ProjectEngagement with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.project_engagements.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getProjectEngagementById('1')).rejects.toThrow(
        'Failed to retrieve project engagement'
      );
    });
  });

  describe('createProjectEngagement', () => {
    it('should create and return a new project engagement', async () => {
      const inputData = {
        project_id: 'proj-1',
        partner_id: 'partner-1',
        chapter_id: 'chapter-1',
        status: 'PROSPECT' as const,
        domain: 'DESIGN_ONLY' as const,
      };
      const createdEngagement = {
        engagement_id: 'new-id-123',
        academic_term_id: null,
        client_contact_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...inputData,
      };
      (prisma.project_engagements.create as jest.Mock).mockResolvedValue(
        createdEngagement
      );

      const result = await createProjectEngagement(inputData);

      expect(result).toEqual(createdEngagement);
      expect(prisma.project_engagements.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.project_engagements.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        createProjectEngagement({
          project_id: 'proj-1',
          partner_id: 'partner-1',
          chapter_id: 'chapter-1',
          status: 'PROSPECT' as const,
          domain: 'DESIGN_ONLY' as const,
        })
      ).rejects.toThrow('Failed to create project engagement');
    });
  });

  describe('updateProjectEngagement', () => {
    it('should update and return the project engagement', async () => {
      const engagementId = '1';
      const updateData = { status: 'COMPLETED' as const };
      const updatedEngagement = {
        engagement_id: engagementId,
        project_id: 'proj-1',
        partner_id: 'partner-1',
        chapter_id: 'chapter-1',
        academic_term_id: 'term-1',
        client_contact_id: 'contact-1',
        status: 'COMPLETED',
        domain: 'FULL_STACK',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_engagements.update as jest.Mock).mockResolvedValue(
        updatedEngagement
      );

      const result = await updateProjectEngagement(engagementId, updateData);

      expect(result).toEqual(updatedEngagement);
      expect(prisma.project_engagements.update).toHaveBeenCalledWith({
        where: { engagement_id: engagementId },
        data: updateData,
      });
    });

    it('should throw NotFoundError when updating non-existent project engagement', async () => {
      (prisma.project_engagements.update as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(
        updateProjectEngagement('non-existent-id', {
          status: 'COMPLETED' as const,
        })
      ).rejects.toThrow(
        "ProjectEngagement with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.project_engagements.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(
        updateProjectEngagement('1', { status: 'COMPLETED' as const })
      ).rejects.toThrow('Failed to update project engagement');
    });
  });

  describe('deleteProjectEngagement', () => {
    it('should call delete with the correct ID and return the deleted engagement', async () => {
      const engagementId = '1';
      const deletedEngagement = {
        engagement_id: engagementId,
        project_id: 'proj-1',
        partner_id: 'partner-1',
        chapter_id: 'chapter-1',
        academic_term_id: 'term-1',
        client_contact_id: 'contact-1',
        status: 'ACTIVE',
        domain: 'FULL_STACK',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.project_engagements.delete as jest.Mock).mockResolvedValue(
        deletedEngagement
      );

      const result = await deleteProjectEngagement(engagementId);

      expect(result).toEqual(deletedEngagement);
      expect(prisma.project_engagements.delete).toHaveBeenCalledWith({
        where: { engagement_id: engagementId },
      });
    });

    it('should throw NotFoundError when deleting non-existent project engagement', async () => {
      (prisma.project_engagements.delete as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        })
      );
      await expect(deleteProjectEngagement('non-existent-id')).rejects.toThrow(
        "ProjectEngagement with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.project_engagements.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteProjectEngagement('1')).rejects.toThrow(
        'Failed to delete project engagement'
      );
    });
  });
});
