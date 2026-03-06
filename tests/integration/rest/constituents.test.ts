import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper function to create a constituent for tests
const createTestConstituent = async () => {
  const uniqueEmail = `test.constituent.rest.${Date.now()}.${Math.random()}@example.com`;
  const constituentData = {
    first_name: 'John',
    last_name: 'Doe',
    primary_email: uniqueEmail,
  };
  const response = await request(app)
    .post('/constituents')
    .send(constituentData);
  return response.body;
};

describe('REST API - /constituents', () => {
  describe('POST /constituents', () => {
    it('should create a new constituent', async () => {
      // Arrange
      const uniqueEmail = `test.create.${Date.now()}.${Math.random()}@example.com`;
      const constituentData = {
        first_name: 'Jane',
        last_name: 'Smith',
        primary_email: uniqueEmail,
        phone_number: '555-0100',
      };

      // Act
      const response = await request(app)
        .post('/constituents')
        .send(constituentData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('constituent_id');
      expect(response.body.first_name).toBe('Jane');
      expect(response.body.last_name).toBe('Smith');
      expect(response.body.primary_email).toBe(uniqueEmail);
    });

    it('should return 400 for invalid data', async () => {
      // Act - missing required fields
      const response = await request(app)
        .post('/constituents')
        .send({ first_name: 'Only' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /constituents', () => {
    it('should fetch all constituents', async () => {
      // Arrange
      await createTestConstituent();

      // Act
      const response = await request(app).get('/constituents');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /constituents/:id', () => {
    it('should fetch a constituent by ID', async () => {
      // Arrange
      const constituent = await createTestConstituent();

      // Act
      const response = await request(app).get(
        `/constituents/${constituent.constituent_id}`
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.constituent_id).toBe(constituent.constituent_id);
    });

    it('should return 404 for non-existent constituent', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/constituents/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /constituents/:id', () => {
    it('should update a constituent', async () => {
      // Arrange
      const constituent = await createTestConstituent();
      const updateData = { first_name: 'Updated' };

      // Act
      const response = await request(app)
        .patch(`/constituents/${constituent.constituent_id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe('Updated');
    });
  });

  describe('DELETE /constituents/:id', () => {
    it('should delete a constituent', async () => {
      // Arrange
      const constituent = await createTestConstituent();

      // Act
      const response = await request(app).delete(
        `/constituents/${constituent.constituent_id}`
      );

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(
        `/constituents/${constituent.constituent_id}`
      );
      expect(getResponse.status).toBe(404);
    });
  });
});
