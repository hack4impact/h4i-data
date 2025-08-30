import request from 'supertest';
import { app } from '../../../src/rest/server';
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

describe('Volunteer REST API Integration Tests', () => {
  const mockVolunteer = {
    volunteer_id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@test.com',
    graduation_date: new Date('2024-06-15'),
    volunteer_status: VolunteerStatus.STUDENT,
    volunteer_type: VolunteerType.CHAPTER,
    university_id: '987e6543-e21b-32d1-b654-426614174000',
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/volunteers', () => {
    it('should return all volunteers successfully', async () => {
      mockedVolunteerService.getAllVolunteers.mockResolvedValue([
        mockVolunteer,
      ]);

      const response = await request(app).get('/api/volunteers');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockVolunteer],
      });
      expect(mockedVolunteerService.getAllVolunteers).toHaveBeenCalledTimes(1);
    });

    it('should handle service layer errors', async () => {
      mockedVolunteerService.getAllVolunteers.mockRejectedValue(
        new Error('Failed to fetch volunteers from database')
      );

      const response = await request(app).get('/api/volunteers');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to fetch volunteers from database',
      });
    });
  });

  describe('GET /api/volunteers/:id', () => {
    it('should return volunteer by ID successfully', async () => {
      mockedVolunteerService.getVolunteerById.mockResolvedValue(mockVolunteer);

      const response = await request(app).get(
        `/api/volunteers/${mockVolunteer.volunteer_id}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockVolunteer,
      });
      expect(mockedVolunteerService.getVolunteerById).toHaveBeenCalledWith(
        mockVolunteer.volunteer_id
      );
    });

    it('should return 404 when volunteer not found', async () => {
      mockedVolunteerService.getVolunteerById.mockRejectedValue(
        new Error('Volunteer not found')
      );

      const response = await request(app).get(
        '/api/volunteers/non-existent-id'
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'Volunteer not found',
      });
    });

    it('should return 400 for invalid ID format', async () => {
      mockedVolunteerService.getVolunteerById.mockRejectedValue(
        new Error('Invalid ID format. Must be a valid UUID')
      );

      const response = await request(app).get('/api/volunteers/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid ID format. Must be a valid UUID',
      });
    });
  });

  describe('POST /api/volunteers', () => {
    const volunteerInput = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@test.com',
      graduation_date: '2024-06-15',
      volunteer_status: VolunteerStatus.STUDENT,
      volunteer_type: VolunteerType.CHAPTER,
      university_id: '987e6543-e21b-32d1-b654-426614174000',
    };

    it('should create volunteer successfully', async () => {
      mockedVolunteerService.createVolunteer.mockResolvedValue(mockVolunteer);

      const response = await request(app)
        .post('/api/volunteers')
        .send(volunteerInput);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: mockVolunteer,
      });
      expect(mockedVolunteerService.createVolunteer).toHaveBeenCalledWith(
        volunteerInput
      );
    });

    it('should return 400 for validation errors', async () => {
      mockedVolunteerService.createVolunteer.mockRejectedValue(
        new Error('Validation failed: email is required')
      );

      const invalidInput = { ...volunteerInput, email: '' };
      const response = await request(app)
        .post('/api/volunteers')
        .send(invalidInput);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Validation failed: email is required',
      });
    });

    it('should return 409 for duplicate email', async () => {
      mockedVolunteerService.createVolunteer.mockRejectedValue(
        new Error('A volunteer with this email already exists')
      );

      const response = await request(app)
        .post('/api/volunteers')
        .send(volunteerInput);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        error: 'A volunteer with this email already exists',
      });
    });
  });

  describe('Root endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Volunteer Management REST API',
        version: '1.0.0',
        endpoints: {
          volunteers: '/api/volunteers',
          health: '/api/health',
        },
      });
    });
  });

  describe('Health check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
        service: 'REST API',
        timestamp: expect.any(String),
      });
    });
  });

  describe('404 handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'Route GET /api/non-existent-route not found',
      });
    });
  });
});
