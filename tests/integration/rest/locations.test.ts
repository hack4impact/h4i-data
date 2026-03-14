import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a location for tests
const createTestLocation = async () => {
  const locationData = {
    name: 'Headquarters',
    address_line: '123 Main Street',
    state_code: 'CA',
    country_code: 'USA',
  };
  const response = await request(app).post('/locations').send(locationData);
  return response.body;
};

describe('REST API - /locations', () => {
  describe('POST /locations', () => {
    it('should create a new location', async () => {
      // Act
      const response = await request(app).post('/locations').send({
        name: 'Headquarters',
        address_line: '123 Main Street',
        state_code: 'CA',
        country_code: 'USA',
      });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('location_id');
      expect(response.body.name).toBe('Headquarters');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { name: 'A' }; // Invalid - name too short or missing required fields
      const response = await request(app).post('/locations').send(invalidData);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /locations', () => {
    it('should fetch all locations', async () => {
      // Arrange
      await createTestLocation();

      // Act
      const response = await request(app).get('/locations');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /locations/:id', () => {
    it('should fetch a location by ID', async () => {
      // Arrange
      const location = await createTestLocation();

      // Act
      const response = await request(app).get(
        `/locations/${location.location_id}`
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.location_id).toBe(location.location_id);
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/locations/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /locations/:id', () => {
    it('should update a location', async () => {
      // Arrange
      const location = await createTestLocation();
      const updateData = { name: 'New York Office' };

      // Act
      const response = await request(app)
        .patch(`/locations/${location.location_id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New York Office');
    });

    it('should return 404 for a non-existent location', async () => {
      const response = await request(app)
        .patch('/locations/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const location = await createTestLocation();
      const response = await request(app)
        .patch(`/locations/${location.location_id}`)
        .send({ name: 'A' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /locations/:id', () => {
    it('should delete a location', async () => {
      // Arrange
      const location = await createTestLocation();

      // Act
      const response = await request(app).delete(
        `/locations/${location.location_id}`
      );

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(
        `/locations/${location.location_id}`
      );
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent location', async () => {
      const response = await request(app).delete(
        '/locations/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
