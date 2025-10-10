import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

// We mock the entire prisma module. This replaces the actual prisma client
// with a mock object that we can control in our tests.
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
  // Before each test, clear all previous mock calls and return values
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return an array of projects', async () => {
      // Arrange: Define the data our mock Prisma should return
      const mockProjects = [
        {
          project_id: '1',
          name: 'Test Project 1',
          description: 'A test project',
          repo: 'A test repo link',
          budget: 20,
          project_type: 'DESIGN_ONLY' as const,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      // Cast the mocked function to jest.Mock
      (prisma.projects.findMany as jest.Mock).mockResolvedValue(mockProjects);

      // Act: Call the service function
      const result = await getAllProjects();

      // Assert: Check if the result matches our mock data
      expect(result).toEqual(mockProjects);
      expect(prisma.projects.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProjectById', () => {
    it('should return a single project when a valid ID is provided', async () => {
      // Arrange
      const projectId = '1';
      const mockProject = {
        project_id: projectId,
        name: 'Test Project 1',
        description: 'A test project',
        repo: 'A test repo link',
        budget: 20,
        project_type: 'DESIGN_ONLY' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.findUnique as jest.Mock).mockResolvedValue(mockProject);

      // Act
      const result = await getProjectById(projectId);

      // Assert
      expect(result).toEqual(mockProject);
      expect(prisma.projects.findUnique).toHaveBeenCalledWith({
        where: { project_id: projectId },
      });
    });

    it('should throw NotFoundError if no project is found', async () => {
      // Arrange
      const projectId = 'non-existent-id';
      (prisma.projects.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(getProjectById(projectId)).rejects.toThrow(
        "Project with id 'non-existent-id' not found"
      );
    });
  });

  describe('createProject', () => {
    it('should create and return a new project', async () => {
      // Arrange
      const inputData = {
        name: 'New Project',
        description: 'A test project',
        repo: 'A test repo link',
        budget: 20,
        project_type: 'DESIGN_ONLY' as const,
      };
      // The data returned from prisma.create will have a Date object
      const createdProject = {
        project_id: 'new-id-123',
        name: 'New Project',
        description: 'A test project',
        repo: 'A test repo link',
        budget: 20,
        project_type: 'DESIGN_ONLY' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.create as jest.Mock).mockResolvedValue(createdProject);

      // Act
      const result = await createProject(inputData);

      // Assert
      expect(result).toEqual(createdProject);
      expect(prisma.projects.create).toHaveBeenCalledWith({ data: inputData });
    });
  });

  describe('updateProject', () => {
    it('should update and return the project', async () => {
      // Arrange
      const projectId = '1';
      const updateData = { name: 'Updated Project Name' };
      const updatedProject = {
        project_id: projectId,
        name: 'Updated Project Name',
        description: 'A test project',
        repo: 'A test repo link',
        budget: 20,
        project_type: 'DESIGN_ONLY' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.update as jest.Mock).mockResolvedValue(updatedProject);

      // Act
      const result = await updateProject(projectId, updateData);

      // Assert
      expect(result).toEqual(updatedProject);
      expect(prisma.projects.update).toHaveBeenCalledWith({
        where: { project_id: projectId },
        data: updateData,
      });
    });
  });

  describe('deleteProject', () => {
    it('should call delete with the correct ID and return the deleted project', async () => {
      // Arrange
      const projectId = '1';
      const deletedProject = {
        project_id: projectId,
        name: 'Deleted Project',
        description: 'A test project',
        repo: 'A test repo link',
        budget: 20,
        project_type: 'DESIGN_ONLY' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.projects.delete as jest.Mock).mockResolvedValue(deletedProject);

      // Act
      const result = await deleteProject(projectId);

      // Assert
      expect(result).toEqual(deletedProject);
      expect(prisma.projects.delete).toHaveBeenCalledWith({
        where: { project_id: projectId },
      });
    });
  });
});
