import request from 'supertest';
import { app } from '../../../src/graphql/server';
import { volunteerService } from '../../../src/services';
import { VolunteerStatus, VolunteerType } from '../../../src/types';

// Mock the service layer
jest.mock('../../../src/services');
jest.mock('../../../src/config/server', () => ({
  config: {
    NODE_ENV: 'test',
    GRAPHQL_PORT: 3000,
    REST_PORT: 3001,
    SUPABASE_URL: 'test-url',
    SEED_DATA: false,
  },
}));

const mockedVolunteerService = volunteerService as jest.Mocked<
  typeof volunteerService
>;

describe('Volunteer GraphQL API Integration Tests', () => {
  const mockVolunteer = {
    volunteer_id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@test.com',
    graduation_date: new Date('2024-06-15'),
    volunteer_status: VolunteerStatus.STUDENT,
    volunteer_type: VolunteerType.CHAPTER,
    university_id: '987e6543-e21b-32d1-b654-426614174000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query: volunteers', () => {
    const query = `
        query GetVolunteers {
          volunteers {
            volunteer_id
            first_name
            last_name
            email
            graduation_date
            volunteer_status
            volunteer_type
            university_id
          }
        }
      `;

    it('should return all volunteers successfully', async () => {
      mockedVolunteerService.getAllVolunteers.mockResolvedValue([
        mockVolunteer,
      ]);

      const response = await request(app).post('/graphql').send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.volunteers).toEqual([mockVolunteer]);
      expect(mockedVolunteerService.getAllVolunteers).toHaveBeenCalledTimes(1);
    });

    it('should handle service layer errors', async () => {
      mockedVolunteerService.getAllVolunteers.mockRejectedValue(
        new Error('Failed to fetch volunteers from database')
      );

      const response = await request(app).post('/graphql').send({ query });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        'Failed to fetch volunteers from database'
      );
    });
  });

  describe('Query: volunteer', () => {
    const query = `
        query GetVolunteer($id: ID!) {
          volunteer(id: $id) {
            volunteer_id
            first_name
            last_name
            email
            graduation_date
            volunteer_status
            volunteer_type
            university_id
          }
        }
      `;

    it('should return volunteer by ID successfully', async () => {
      mockedVolunteerService.getVolunteerById.mockResolvedValue(mockVolunteer);

      const response = await request(app)
        .post('/graphql')
        .send({
          query,
          variables: { id: mockVolunteer.volunteer_id },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.volunteer).toEqual(mockVolunteer);
      expect(mockedVolunteerService.getVolunteerById).toHaveBeenCalledWith(
        mockVolunteer.volunteer_id
      );
    });

    it('should handle not found errors', async () => {
      mockedVolunteerService.getVolunteerById.mockRejectedValue(
        new Error('Volunteer not found')
      );

      const response = await request(app)
        .post('/graphql')
        .send({
          query,
          variables: { id: 'non-existent-id' },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Volunteer not found');
    });
  });

  describe('Mutation: createVolunteer', () => {
    const mutation = `
        mutation CreateVolunteer($input: VolunteerInput!) {
          createVolunteer(input: $input) {
            volunteer_id
            first_name
            last_name
            email
            graduation_date
            volunteer_status
            volunteer_type
            university_id
          }
        }
      `;

    const volunteerInput = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@test.com',
      graduation_date: '2024-06-15T00:00:00.000Z',
      volunteer_status: VolunteerStatus.STUDENT,
      volunteer_type: VolunteerType.CHAPTER,
      university_id: '987e6543-e21b-32d1-b654-426614174000',
    };

    it('should create volunteer successfully', async () => {
      mockedVolunteerService.createVolunteer.mockResolvedValue(mockVolunteer);

      const response = await request(app)
        .post('/graphql')
        .send({
          query: mutation,
          variables: { input: volunteerInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.createVolunteer).toEqual(mockVolunteer);
      expect(mockedVolunteerService.createVolunteer).toHaveBeenCalledWith(
        volunteerInput
      );
    });

    it('should handle validation errors', async () => {
      mockedVolunteerService.createVolunteer.mockRejectedValue(
        new Error('Validation failed: email is required')
      );

      const response = await request(app)
        .post('/graphql')
        .send({
          query: mutation,
          variables: { input: volunteerInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        'Validation failed: email is required'
      );
    });

    it('should handle duplicate email errors', async () => {
      mockedVolunteerService.createVolunteer.mockRejectedValue(
        new Error('A volunteer with this email already exists')
      );

      const response = await request(app)
        .post('/graphql')
        .send({
          query: mutation,
          variables: { input: volunteerInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        'A volunteer with this email already exists'
      );
    });
  });

  describe('DateTime scalar', () => {
    const query = `
        query GetVolunteers {
          volunteers {
            graduation_date
          }
        }
      `;

    it('should handle DateTime scalar correctly', async () => {
      const volunteerWithDate = {
        ...mockVolunteer,
        graduation_date: new Date('2024-06-15T10:30:00.000Z'),
      };

      mockedVolunteerService.getAllVolunteers.mockResolvedValue([
        volunteerWithDate,
      ]);

      const response = await request(app).post('/graphql').send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.volunteers[0].graduation_date).toBe(
        '2024-06-15T10:30:00.000Z'
      );
    });
  });

  describe('Health check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
        service: 'GraphQL API',
      });
    });
  });
});
