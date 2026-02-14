import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    projects: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return an array of projects', async () => {
      const mockProjects = [
        {
          project_id: '1',
          name: 'Test Project 1',
          github_url: 'https://github.com/org/repo',
          financial: 'PRO_BONO',
          status: 'WORKING',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.projects.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getAllProjects();

      expect(result).toEqual(mockProjects);
      expect(prisma.projects.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return empty array when no projects exist', async () => {
      (prisma.projects.findMany as jest.Mock).mockResolvedValue([]);
      const result = await getAllProjects();
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError when database fails', async () => {
      (prisma.projects.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getAllProjects()).rejects.toThrow(
        'Failed to retrieve projects'
      );
    });
  });

  describe('getProjectById', () => {
    it('should return a single project when a valid ID is provided', async () => {
      const projectId = '1';
      const mockProject = {
        project_id: projectId,
        name: 'Test Project 1',
        github_url: 'https://github.com/org/repo',
        financial: 'PRO_BONO',
        status: 'WORKING',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectById(projectId);

      expect(result).toEqual(mockProject);
      expect(prisma.projects.findUnique).toHaveBeenCalledWith({
        where: { project_id: projectId },
      });
    });

    it('should throw NotFoundError if no project is found', async () => {
      const projectId = 'non-existent-id';
      (prisma.projects.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProjectById(projectId)).rejects.toThrow(
        "Project with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected error', async () => {
      (prisma.projects.findUnique as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(getProjectById('1')).rejects.toThrow(
        'Failed to retrieve project'
      );
    });
  });

  describe('createProject', () => {
    it('should create and return a new project', async () => {
      const inputData = {
        name: 'New Project',
        github_url: 'https://github.com/org/new-repo',
        financial: 'PRO_BONO' as const,
      };
      const createdProject = {
        project_id: 'new-id-123',
        name: 'New Project',
        github_url: 'https://github.com/org/new-repo',
        financial: 'PRO_BONO',
        status: 'WORKING',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.create as jest.Mock).mockResolvedValue(createdProject);

      const result = await createProject(inputData);

      expect(result).toEqual(createdProject);
      expect(prisma.projects.create).toHaveBeenCalledWith({ data: inputData });
    });

    it('should throw DatabaseError when create fails', async () => {
      (prisma.projects.create as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(createProject({ name: 'New Project' })).rejects.toThrow(
        'Failed to create project'
      );
    });
  });

  describe('updateProject', () => {
    it('should update and return the project', async () => {
      const projectId = '1';
      const updateData = { name: 'Updated Project Name' };
      const updatedProject = {
        project_id: projectId,
        name: 'Updated Project Name',
        github_url: 'https://github.com/org/repo',
        financial: 'PRO_BONO',
        status: 'WORKING',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.update as jest.Mock).mockResolvedValue(updatedProject);

      const result = await updateProject(projectId, updateData);

      expect(result).toEqual(updatedProject);
      expect(prisma.projects.update).toHaveBeenCalledWith({
        where: { project_id: projectId },
        data: updateData,
      });
    });

    it('should throw NotFoundError when updating non-existent project', async () => {
      (prisma.projects.update as jest.Mock).mockRejectedValue(
        new Error('Record to update not found')
      );
      await expect(
        updateProject('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow("Project with id 'non-existent-id' not found");
    });

    it('should throw DatabaseError on unexpected update error', async () => {
      (prisma.projects.update as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(updateProject('1', { name: 'Updated' })).rejects.toThrow(
        'Failed to update project'
      );
    });
  });

  describe('deleteProject', () => {
    it('should call delete with the correct ID and return the deleted project', async () => {
      const projectId = '1';
      const deletedProject = {
        project_id: projectId,
        name: 'Deleted Project',
        github_url: 'https://github.com/org/repo',
        financial: 'PRO_BONO',
        status: 'WORKING',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.delete as jest.Mock).mockResolvedValue(deletedProject);

      const result = await deleteProject(projectId);

      expect(result).toEqual(deletedProject);
      expect(prisma.projects.delete).toHaveBeenCalledWith({
        where: { project_id: projectId },
      });
    });

    it('should throw NotFoundError when deleting non-existent project', async () => {
      (prisma.projects.delete as jest.Mock).mockRejectedValue(
        new Error('Record to delete does not exist')
      );
      await expect(deleteProject('non-existent-id')).rejects.toThrow(
        "Project with id 'non-existent-id' not found"
      );
    });

    it('should throw DatabaseError on unexpected delete error', async () => {
      (prisma.projects.delete as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );
      await expect(deleteProject('1')).rejects.toThrow(
        'Failed to delete project'
      );
    });
  });
});
