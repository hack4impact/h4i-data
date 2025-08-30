import { connectToDB, disconnectFromDB } from '../../../src/config/database';
import { seedData } from '../../../src/scripts/seed';
import { volunteerService } from '../../../src/services';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/services');

const mockedConnectToDB = connectToDB as jest.MockedFunction<
  typeof connectToDB
>;
const mockedDisconnectFromDB = disconnectFromDB as jest.MockedFunction<
  typeof disconnectFromDB
>;
const mockedVolunteerService = volunteerService as jest.Mocked<
  typeof volunteerService
>;

describe('Seed Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid test output noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should seed data successfully', async () => {
    mockedConnectToDB.mockResolvedValue();
    mockedVolunteerService.createVolunteer.mockResolvedValue({
      volunteer_id: '123',
      first_name: 'Sophia',
      last_name: 'Chang',
      email: 'sophia@test.com',
    } as any);

    await seedData();

    expect(mockedConnectToDB).toHaveBeenCalledTimes(1);
    expect(mockedVolunteerService.createVolunteer).toHaveBeenCalledTimes(2);
    expect(mockedDisconnectFromDB).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('Sample data seeded successfully');
  });

  it('should handle volunteer creation errors gracefully', async () => {
    mockedConnectToDB.mockResolvedValue();
    mockedVolunteerService.createVolunteer
      .mockRejectedValueOnce(
        new Error('A volunteer with this email already exists')
      )
      .mockResolvedValueOnce({} as any);

    await seedData();

    expect(mockedVolunteerService.createVolunteer).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith(
      '- Volunteer already exists: Sophia Chang'
    );
    expect(console.log).toHaveBeenCalledWith('✓ Created volunteer: John Doe');
  });

  it('should handle database connection errors', async () => {
    mockedConnectToDB.mockRejectedValue(new Error('Connection failed'));

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process exit: ${code}`);
    });

    await expect(seedData()).rejects.toThrow('Process exit: 1');

    expect(console.error).toHaveBeenCalledWith(
      'Failed to seed data:',
      expect.any(Error)
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
  });
});
