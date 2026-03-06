import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper function to create a constituent for tests
const createTestConstituent = async () => {
  const uniqueEmail = `test.mentor.rest.${Date.now()}.${Math.random()}@example.com`;
  const constituentData = {
    first_name: 'Jane',
    last_name: 'Smith',
    primary_email: uniqueEmail,
  };
  const response = await request(app)
    .post('/constituents')
    .send(constituentData);
  return response.body.constituent_id;
};

// Helper function to create a mentor for tests
const createTestMentor = async (constituentId: string) => {
  const mentorData = {
    mentor_id: constituentId,
    status: 'ACTIVE',
    expertise_area: 'Web Development',
    max_mentees: 3,
  };
  const response = await request(app).post('/mentors').send(mentorData);
  return response.body.mentor_id;
};

describe('REST API - /mentors', () => {
  describe('POST /mentors', () => {
    it('should create a new mentor', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const mentorData = {
        mentor_id: constituentId,
        status: 'ACTIVE',
        expertise_area: 'Data Science',
        max_mentees: 5,
      };

      // Act
      const response = await request(app).post('/mentors').send(mentorData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('mentor_id', constituentId);
      expect(response.body.expertise_area).toBe('Data Science');
    });

    it('should return 400 for invalid data', async () => {
      // Act
      const response = await request(app)
        .post('/mentors')
        .send({ expertise_area: 'Invalid' }); // Missing mentor_id

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /mentors', () => {
    it('should fetch all mentors', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      await createTestMentor(constituentId);

      // Act
      const response = await request(app).get('/mentors');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /mentors/:id', () => {
    it('should fetch a mentor by ID', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const mentorId = await createTestMentor(constituentId);

      // Act
      const response = await request(app).get(`/mentors/${mentorId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.mentor_id).toBe(mentorId);
    });

    it('should return 404 for non-existent mentor', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/mentors/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /mentors/:id', () => {
    it('should update a mentor', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const mentorId = await createTestMentor(constituentId);
      const updateData = {
        expertise_area: 'Machine Learning',
        max_mentees: 10,
      };

      // Act
      const response = await request(app)
        .patch(`/mentors/${mentorId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.expertise_area).toBe('Machine Learning');
      expect(response.body.max_mentees).toBe(10);
    });

    it('should return 404 for a non-existent mentor', async () => {
      const response = await request(app)
        .patch('/mentors/00000000-0000-0000-0000-000000000000')
        .send({ expertise_area: 'Updated' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const constituentId = await createTestConstituent();
      const mentorId = await createTestMentor(constituentId);
      const response = await request(app)
        .patch(`/mentors/${mentorId}`)
        .send({ status: 'INVALID_STATUS' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /mentors/:id', () => {
    it('should delete a mentor', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      const mentorId = await createTestMentor(constituentId);

      // Act
      const response = await request(app).delete(`/mentors/${mentorId}`);

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(`/mentors/${mentorId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent mentor', async () => {
      const response = await request(app).delete(
        '/mentors/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
