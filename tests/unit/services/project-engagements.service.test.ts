import {
  getAllProjectEngagements,
  getProjectEngagementById,
  createProjectEngagement,
  updateProjectEngagement,
  deleteProjectEngagement,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

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
      expect(prisma.project_engagements.findMany).toHaveBeenCalledTimes(1);
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
  });
});
