import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper function to create a constituent for tests
const createTestConstituent = async () => {
  const uniqueEmail = `test.constituent.rest.${Date.now()}@example.com`;
  const constituentData = {
    first_name: 'John',
    last_name: 'Doe',
    primary_email: uniqueEmail,
  };
  const response = await request(app)
    .post('/constituents')
    .send(constituentData);
  return response.body.constituent_id;
};

// Helper function to create a volunteer for tests
const createTestVolunteer = async (constituentId: string) => {
  const volunteerData = {
    volunteer_id: constituentId,
    org_email: 'john@org.edu',
    volunteer_class: 'COLLEGIATE',
  };
  const response = await request(app).post('/volunteers').send(volunteerData);
  return response.body.volunteer_id;
};

describe('REST API - /volunteers', () => {
  describe('POST /volunteers', () => {
    it('should create a new volunteer', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const volunteerData = {
        volunteer_id: constituentId,
        org_email: 'john@org.edu',
        active_status: true,
        volunteer_class: 'COLLEGIATE',
        engagement_track: 'PROGRAMS',
        major: 'Computer Science',
        education_level: 'UNDERGRADUATE',
      };

      // Act
      const response = await request(app)
        .post('/volunteers')
        .send(volunteerData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('volunteer_id', constituentId);
      expect(response.body.org_email).toBe('john@org.edu');
    });

    it('should return 400 for invalid data', async () => {
      // Act
      const response = await request(app)
        .post('/volunteers')
        .send({ org_email: 'invalid-email' }); // Missing volunteer_id, invalid email

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /volunteers', () => {
    it('should fetch all volunteers', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      await createTestVolunteer(constituentId);

      // Act
      const response = await request(app).get('/volunteers');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /volunteers/:id', () => {
    it('should fetch a volunteer by ID', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const volunteerId = await createTestVolunteer(constituentId);

      // Act
      const response = await request(app).get(`/volunteers/${volunteerId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.volunteer_id).toBe(volunteerId);
    });

    it('should return 404 for non-existent volunteer', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/volunteers/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /volunteers/:id', () => {
    it('should update a volunteer', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const volunteerId = await createTestVolunteer(constituentId);
      const updateData = { major: 'Software Engineering' };

      // Act
      const response = await request(app)
        .patch(`/volunteers/${volunteerId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.major).toBe('Software Engineering');
    });
  });

  describe('DELETE /volunteers/:id', () => {
    it('should delete a volunteer', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const volunteerId = await createTestVolunteer(constituentId);

      // Act
      const response = await request(app).delete(`/volunteers/${volunteerId}`);

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(`/volunteers/${volunteerId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
