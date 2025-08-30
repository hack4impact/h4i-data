import request from 'supertest';
import { app } from '../../../src/rest/server';
import { prisma } from '../../../src/config/database';
import { mockVolunteerData, cleanupTestData } from '../../fixtures/testData';

describe('Volunteer REST API Integration', () => {
  // clean up test data before each test
  beforeEach(async () => {
    await cleanupTestData();
  });

  // disconnect after all tests
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/volunteers', () => {
    it('should create a new volunteer', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send(mockVolunteerData.validStudent)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe('John');
      expect(response.body.data.email).toBe('john.student@test.com');

      // verify it actually exists in database
      const dbVolunteer = await prisma.volunteers.findUnique({
        where: { volunteer_id: response.body.data.volunteer_id },
      });
      expect(dbVolunteer).not.toBeNull();
      expect(dbVolunteer?.first_name).toBe('John');
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/api/volunteers')
        .send({ first_name: '' }) // missing required fields
        .expect(400);
    });
  });

  describe('GET /api/volunteers', () => {
    it('should fetch all volunteers', async () => {
      // create test volunteer first
      await prisma.volunteers.create({
        data: mockVolunteerData.validStudent,
      });

      const response = await request(app).get('/api/volunteers').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].first_name).toBe('John');
    });

    it('should return empty array when no volunteers exist', async () => {
      const response = await request(app).get('/api/volunteers').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/volunteers/:id', () => {
    it('should fetch volunteer by ID', async () => {
      // create test volunteer
      const volunteer = await prisma.volunteers.create({
        data: mockVolunteerData.validStudent,
      });

      const response = await request(app)
        .get(`/api/volunteers/${volunteer.volunteer_id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.volunteer_id).toBe(volunteer.volunteer_id);
      expect(response.body.data.first_name).toBe('John');
    });

    it('should return 404 for non-existent volunteer', async () => {
      const fakeId = '999e9999-e99b-99d9-a999-999999999999';

      await request(app).get(`/api/volunteers/${fakeId}`).expect(404);
    });
  });
});
