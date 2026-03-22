import {
  getAllNonprofits,
  getNonprofitById,
  createNonprofit,
  updateNonprofit,
  deleteNonprofit,
  getNonprofitsWithFilters,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

// Mock prisma client
jest.mock('../../../src/config/database', () => ({
  prisma: {
    nonprofits: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Nonprofit Service', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNonprofits', () => {
    it('should return an array of nonprofits', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Test Nonprofit 1',
          mission: 'A test nonprofit',
          website: 'A test repo link',
          location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
          contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getAllNonprofits();

      expect(result).toEqual(mockNonprofits);
      expect(prisma.nonprofits.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.nonprofits.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('getNonprofitById', () => {
    it('should return a single nonprofit when a valid ID is provided', async () => {
      const nonprofitId = '1';
      const baseDate = new Date();
      // get current time
      const futureDate = new Date(
        baseDate.getTime() + 1000 * 60 * 60 * 24 * 365
      ); // 1 year in the future
      const mockNonprofit = {
        nonprofit_id: '1',
        name: 'Test Nonprofit 1',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
        created_at: baseDate,
        updated_at: baseDate,
        nonprofit_chapter_project: [
          {
            start_date: baseDate,
            end_date: futureDate,
            project_status: 'ACTIVE',
            chapter_id: 'chapter-1',
          },
        ],
      };
      (prisma.nonprofits.findUnique as jest.Mock).mockResolvedValue(
        mockNonprofit
      );

      const result = await getNonprofitById(nonprofitId);

      expect(result.nonprofit_id).toBe(mockNonprofit.nonprofit_id);
      expect(result.name).toBe(mockNonprofit.name);
      expect(prisma.nonprofits.findUnique).toHaveBeenCalledWith({
        where: { nonprofit_id: nonprofitId },
        include: {
          nonprofit_chapter_project: {
            select: {
              start_date: true,
              end_date: true,
              project_status: true,
              chapter_id: true,
            },
          },
        },
      });

      expect(result.status).toBe('ACTIVE');
    });

    it('should throw NotFoundError if no nonprofit is found', async () => {
      const nonprofitId = 'non-existent-id';
      (prisma.nonprofits.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getNonprofitById(nonprofitId)).rejects.toThrow(
        "Nonprofit with id 'non-existent-id' not found"
      );
    });
  });

  describe('createNonprofit', () => {
    it('should create and return a new nonprofit', async () => {
      const inputData = {
        name: 'Test Nonprofit 1',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
      };

      const createdNonprofit = {
        nonprofit_id: '1',
        ...inputData,
        created_at: new Date(),
        updated_at: new Date(),
        nonprofit_chapter_project: [], // New nonprofit has no projects
      };

      (prisma.nonprofits.create as jest.Mock).mockResolvedValue(
        createdNonprofit
      );

      const result = await createNonprofit(inputData);

      expect(result.nonprofit_id).toBe(createdNonprofit.nonprofit_id);
      expect(result.name).toBe(createdNonprofit.name);
      expect(result.status).toBe('INACTIVE'); // New nonprofit with no projects is INACTIVE

      expect(prisma.nonprofits.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: inputData.name,
          mission: inputData.mission,
          contact_id: inputData.contact_id,
          website: inputData.website,
          location_id: inputData.location_id,
        }),
        include: {
          nonprofit_chapter_project: {
            select: {
              start_date: true,
              end_date: true,
              project_status: true,
              chapter_id: true,
            },
          },
        },
      });
    });
  });

  describe('updateNonprofit', () => {
    it('should update and return the nonprofit', async () => {
      const nonprofitId = '1';
      const updateData = { name: 'Updated Nonprofit Name' };
      const baseDate = new Date();
      // get current time
      const futureDate = new Date(
        baseDate.getTime() + 1000 * 60 * 60 * 24 * 365
      ); // 1 year in the future

      const updatedNonprofit = {
        nonprofit_id: '1',
        name: 'Updated Nonprofit Name',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
        created_at: baseDate,
        updated_at: baseDate,
        nonprofit_chapter_project: [
          {
            start_date: baseDate,
            end_date: futureDate,
            project_status: 'ACTIVE',
            chapter_id: 'chapter-1',
          },
        ],
      };

      (prisma.nonprofits.update as jest.Mock).mockResolvedValue(
        updatedNonprofit
      );

      const result = await updateNonprofit(nonprofitId, updateData);

      expect(result.nonprofit_id).toBe(updatedNonprofit.nonprofit_id);
      expect(result.name).toBe(updatedNonprofit.name);
      expect(result.status).toBe('ACTIVE');
      expect(prisma.nonprofits.update).toHaveBeenCalledWith({
        where: { nonprofit_id: nonprofitId },
        data: updateData,
        include: {
          nonprofit_chapter_project: {
            select: {
              start_date: true,
              end_date: true,
              project_status: true,
              chapter_id: true,
            },
          },
        },
      });
    });
  });

  describe('deleteNonprofit', () => {
    it('should call delete with the correct ID and return the deleted nonprofit', async () => {
      const nonprofitId = '1';
      const baseDate = new Date();
      const deletedNonprofit = {
        nonprofit_id: nonprofitId,
        name: 'Test Nonprofit 1',
        mission: 'A test nonprofit',
        website: 'A test repo link',
        location_id: '0d0f34a1-3f6f-4f7f-8a9e-0e1a2b3c4d5e',
        contact_id: 'e9ded8b8-53e3-4747-aafa-d662458c2a65',
        created_at: baseDate,
        updated_at: baseDate,
        nonprofit_chapter_project: [], // No projects
      };

      (prisma.nonprofits.findUnique as jest.Mock).mockResolvedValue(
        deletedNonprofit
      );
      (prisma.nonprofits.delete as jest.Mock).mockResolvedValue(
        deletedNonprofit
      );

      const result = await deleteNonprofit(nonprofitId);

      expect(result.nonprofit_id).toBe(deletedNonprofit.nonprofit_id);
      expect(result.name).toBe(deletedNonprofit.name);
      expect(result.status).toBe('INACTIVE'); // No projects means INACTIVE
      expect(prisma.nonprofits.findUnique).toHaveBeenCalledWith({
        where: { nonprofit_id: nonprofitId },
        include: {
          nonprofit_chapter_project: {
            select: {
              start_date: true,
              end_date: true,
              project_status: true,
              chapter_id: true,
            },
          },
        },
      });
      expect(prisma.nonprofits.delete).toHaveBeenCalledWith({
        where: { nonprofit_id: nonprofitId },
      });
    });
  });

  describe('getNonprofitsWithFilters', () => {
    const baseDate = new Date('2024-01-01');
    const now = new Date();
    // get current time
    const futureDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365); // 1 year in the future
    const pastDate = new Date('2023-01-01');

    it('should return all nonprofits with derived status when no filters are provided', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Active Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: baseDate,
              end_date: futureDate,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
        {
          nonprofit_id: '2',
          name: 'Inactive Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-2',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: pastDate,
              end_date: pastDate,
              project_status: 'INACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({});

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('ACTIVE');
      expect(result[1].status).toBe('INACTIVE');
    });

    it('should filter nonprofits by chapter IDs', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Nonprofit 1',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: baseDate,
              end_date: null,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      await getNonprofitsWithFilters({ chapterIds: ['chapter-1'] });

      expect(prisma.nonprofits.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            nonprofit_chapter_project: {
              some: {
                chapter_id: {
                  in: ['chapter-1'],
                },
              },
            },
          },
        })
      );
    });

    it('should filter nonprofits by ACTIVE status', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Active Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: baseDate,
              end_date: futureDate,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
        {
          nonprofit_id: '2',
          name: 'Inactive Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-2',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: pastDate,
              end_date: pastDate,
              project_status: 'INACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({ statuses: ['ACTIVE'] });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('ACTIVE');
      expect(result[0].name).toBe('Active Nonprofit');
    });

    it('should sort nonprofits A to Z by name', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Zebra Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
        {
          nonprofit_id: '2',
          name: 'Alpha Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-2',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
        {
          nonprofit_id: '3',
          name: 'Beta Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-3',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({ sort: ['A_TO_Z'] });

      expect(result[0].name).toBe('Alpha Nonprofit');
      expect(result[1].name).toBe('Beta Nonprofit');
      expect(result[2].name).toBe('Zebra Nonprofit');
    });

    it('should sort nonprofits Z to A by name', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Alpha Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
        {
          nonprofit_id: '2',
          name: 'Zebra Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-2',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({ sort: ['Z_TO_A'] });

      expect(result[0].name).toBe('Zebra Nonprofit');
      expect(result[1].name).toBe('Alpha Nonprofit');
    });

    it('should sort nonprofits by most recent project start date', async () => {
      const oldDate = new Date('2023-01-01');
      const recentDate = new Date('2024-06-01');

      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Old Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: oldDate,
              end_date: null,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
        {
          nonprofit_id: '2',
          name: 'Recent Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-2',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: recentDate,
              end_date: null,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
        {
          nonprofit_id: '3',
          name: 'No Projects Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-3',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({ sort: ['MOST_RECENT'] });

      expect(result[0].name).toBe('Recent Nonprofit');
      expect(result[1].name).toBe('Old Nonprofit');
      expect(result[2].name).toBe('No Projects Nonprofit');
    });

    it('should sort nonprofits by status (ACTIVE first)', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Inactive Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: pastDate,
              end_date: pastDate,
              project_status: 'INACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
        {
          nonprofit_id: '2',
          name: 'Active Nonprofit',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-2',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: baseDate,
              end_date: futureDate,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({ sort: ['STATUS'] });

      expect(result[0].status).toBe('ACTIVE');
      expect(result[1].status).toBe('INACTIVE');
    });

    it('should combine multiple sort options (STATUS then MOST_RECENT)', async () => {
      const oldDate = new Date('2023-01-01');
      const recentDate = new Date('2024-06-01');

      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Old Active',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: oldDate,
              end_date: futureDate,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
        {
          nonprofit_id: '2',
          name: 'Recent Active',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-2',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: recentDate,
              end_date: futureDate,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
        {
          nonprofit_id: '3',
          name: 'Inactive',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-3',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: recentDate,
              end_date: pastDate,
              project_status: 'INACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({
        sort: ['STATUS', 'MOST_RECENT'],
      });

      // Both active nonprofits should come first, sorted by most recent
      expect(result[0].name).toBe('Recent Active');
      expect(result[0].status).toBe('ACTIVE');
      expect(result[1].name).toBe('Old Active');
      expect(result[1].status).toBe('ACTIVE');
      expect(result[2].name).toBe('Inactive');
      expect(result[2].status).toBe('INACTIVE');
    });

    it('should determine ACTIVE status when project has no end_date', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Ongoing Project',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: baseDate,
              end_date: null,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({});

      expect(result[0].status).toBe('ACTIVE');
    });

    it('should determine INACTIVE status when all projects have ended', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'Ended Projects',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [
            {
              start_date: pastDate,
              end_date: pastDate,
              project_status: 'ACTIVE',
              chapter_id: 'chapter-1',
            },
          ],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({});

      expect(result[0].status).toBe('INACTIVE');
    });

    it('should determine INACTIVE status when nonprofit has no projects', async () => {
      const mockNonprofits = [
        {
          nonprofit_id: '1',
          name: 'No Projects',
          mission: 'Test mission',
          website: null,
          location_id: null,
          contact_id: 'contact-1',
          created_at: baseDate,
          updated_at: baseDate,
          nonprofit_chapter_project: [],
        },
      ];

      (prisma.nonprofits.findMany as jest.Mock).mockResolvedValue(
        mockNonprofits
      );

      const result = await getNonprofitsWithFilters({});

      expect(result[0].status).toBe('INACTIVE');
    });
  });
});
