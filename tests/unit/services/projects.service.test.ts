import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsWithFilters,
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

  describe('getProjectsWithFilters', () => {
    const baseDate = new Date('2024-01-01');
    const mockProjectsWithRelations = [
      {
        project_id: '1',
        name: 'Project 1',
        description: 'Test project 1',
        repo: 'repo1',
        budget: 100,
        project_type: 'DESIGN_ONLY' as const,
        created_at: baseDate,
        updated_at: baseDate,
        nonprofit_chapter_project: [
          {
            start_date: new Date('2024-01-01'),
            end_date: new Date('2024-06-01'), // 152 days
            project_status: 'ACTIVE' as const,
          },
        ],
      },
      {
        project_id: '2',
        name: 'Project 2',
        description: 'Test project 2',
        repo: 'repo2',
        budget: 200,
        project_type: 'DEVELOP_ONLY' as const,
        created_at: baseDate,
        updated_at: baseDate,
        nonprofit_chapter_project: [
          {
            start_date: new Date('2024-01-01'),
            end_date: new Date('2024-12-01'), // 335 days
            project_status: 'ACTIVE' as const,
          },
        ],
      },
      {
        project_id: '3',
        name: 'Project 3',
        description: 'Test project 3',
        repo: 'repo3',
        budget: 300,
        project_type: 'DESIGN_AND_DEVELOP' as const,
        created_at: baseDate,
        updated_at: baseDate,
        nonprofit_chapter_project: [
          {
            start_date: new Date('2024-01-01'),
            end_date: new Date('2024-03-01'), // 60 days
            project_status: 'INACTIVE' as const,
          },
        ],
      },
      {
        project_id: '4',
        name: 'Project 4',
        description: 'Test project 4',
        repo: 'repo4',
        budget: 400,
        project_type: 'CONSULT' as const,
        created_at: baseDate,
        updated_at: baseDate,
        nonprofit_chapter_project: [
          {
            start_date: new Date('2024-01-01'),
            end_date: null, // Ongoing project
            project_status: 'ACTIVE' as const,
          },
        ],
      },
    ];

    beforeEach(() => {
      (prisma.projects.findMany as jest.Mock).mockResolvedValue(
        mockProjectsWithRelations
      );
    });

    it('should return all projects when no filters are provided', async () => {
      // Act
      const result = await getProjectsWithFilters({});

      // Assert
      expect(result).toHaveLength(4);
      expect(prisma.projects.findMany).toHaveBeenCalledWith({
        include: {
          nonprofit_chapter_project: {
            select: {
              start_date: true,
              end_date: true,
              project_status: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter projects by single status', async () => {
      // Act
      const result = await getProjectsWithFilters({ statuses: ['ACTIVE'] });

      // Assert
      expect(result).toHaveLength(3); // Projects 1, 2, and 4 are ACTIVE
      expect(result.every((p) => p.project_id !== '3')).toBe(true);
    });

    it('should filter projects by multiple statuses', async () => {
      // Act
      const result = await getProjectsWithFilters({
        statuses: ['ACTIVE', 'INACTIVE'],
      });

      // Assert
      expect(result).toHaveLength(4); // All projects match
    });

    it('should filter projects by INACTIVE status only', async () => {
      // Act
      const result = await getProjectsWithFilters({ statuses: ['INACTIVE'] });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].project_id).toBe('3');
    });

    it('should sort projects by longest to shortest', async () => {
      // Mock Date.now() to return a fixed date for ongoing project calculation
      const mockNow = new Date('2024-12-31');
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);

      // Act
      const result = await getProjectsWithFilters({
        lengthSort: 'LONGEST_TO_SHORTEST',
      });

      // Assert - Project 4 (ongoing, ~365 days) should be first, then 2 (335), 1 (152), 3 (60)
      expect(result[0].project_id).toBe('4'); // Ongoing project (longest)
      expect(result[1].project_id).toBe('2'); // 335 days
      expect(result[2].project_id).toBe('1'); // 152 days
      expect(result[3].project_id).toBe('3'); // 60 days

      jest.restoreAllMocks();
    });

    it('should sort projects by shortest to longest', async () => {
      // Mock Date.now() to return a fixed date for ongoing project calculation
      const mockNow = new Date('2024-12-31');
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);

      // Act
      const result = await getProjectsWithFilters({
        lengthSort: 'SHORTEST_TO_LONGEST',
      });

      // Assert - Project 3 (60 days) should be first, then 1 (152), 2 (335), 4 (ongoing)
      expect(result[0].project_id).toBe('3'); // 60 days
      expect(result[1].project_id).toBe('1'); // 152 days
      expect(result[2].project_id).toBe('2'); // 335 days
      expect(result[3].project_id).toBe('4'); // Ongoing project (longest)

      jest.restoreAllMocks();
    });

    it('should filter by status and sort by length', async () => {
      // Mock Date.now() to return a fixed date for ongoing project calculation
      const mockNow = new Date('2024-12-31');
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);

      // Act
      const result = await getProjectsWithFilters({
        statuses: ['ACTIVE'],
        lengthSort: 'LONGEST_TO_SHORTEST',
      });

      // Assert - Only ACTIVE projects, sorted by length
      expect(result).toHaveLength(3);
      expect(result.every((p) => p.project_id !== '3')).toBe(true); // No INACTIVE
      expect(result[0].project_id).toBe('4'); // Ongoing (longest)
      expect(result[1].project_id).toBe('2'); // 335 days
      expect(result[2].project_id).toBe('1'); // 152 days

      jest.restoreAllMocks();
    });

    it('should handle projects with no nonprofit_chapter_project entries', async () => {
      // Arrange
      const projectsWithNoRelations = [
        {
          project_id: '5',
          name: 'Project 5',
          description: 'Test project 5',
          repo: 'repo5',
          budget: 500,
          project_type: 'MAINTAIN' as const,
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
      ];
      (prisma.projects.findMany as jest.Mock).mockResolvedValue(
        projectsWithNoRelations
      );

      // Act
      const result = await getProjectsWithFilters({ statuses: ['ACTIVE'] });

      // Assert - Project with no relations should not match status filter
      expect(result).toHaveLength(0);
    });

    it('should handle projects with null end_date (ongoing projects)', async () => {
      // Mock Date.now() to return a fixed date
      const mockNow = new Date('2024-12-31');
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);

      // Act
      const result = await getProjectsWithFilters({
        lengthSort: 'LONGEST_TO_SHORTEST',
      });

      // Assert - Ongoing project should be calculated using current date
      expect(result.length).toBeGreaterThan(0);

      jest.restoreAllMocks();
    });
  });
});
