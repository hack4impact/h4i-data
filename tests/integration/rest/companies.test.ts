import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a company for tests
const createTestCompany = async () => {
  const response = await request(app)
    .post('/companies')
    .send({ name: `Test Company ${Date.now()}.${Math.random()}` });
  return response.body;
};

describe('REST API - /companies', () => {
  describe('POST /companies', () => {
    it('should create a new company', async () => {
      // Act
      const response = await request(app)
        .post('/companies')
        .send({ name: `Test Company ${Date.now()}.${Math.random()}` });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('company_id');
    });

    it('should return 400 for invalid data', async () => {
      // Act - empty name should be invalid
      const response = await request(app).post('/companies').send({ name: '' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /companies', () => {
    it('should fetch all companies', async () => {
      // Arrange
      await createTestCompany();

      // Act
      const response = await request(app).get('/companies');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /companies/:id', () => {
    it('should fetch a company by ID', async () => {
      // Arrange
      const company = await createTestCompany();

      // Act
      const response = await request(app).get(
        `/companies/${company.company_id}`
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.company_id).toBe(company.company_id);
    });

    it('should return 404 for a non-existent company ID', async () => {
      // Act
      const response = await request(app).get(
        '/companies/00000000-0000-0000-0000-000000000000'
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /companies/:id', () => {
    it('should update a company', async () => {
      // Arrange
      const company = await createTestCompany();

      // Act
      const response = await request(app)
        .patch(`/companies/${company.company_id}`)
        .send({ name: 'Updated Company Name' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Company Name');
    });
  });

  describe('DELETE /companies/:id', () => {
    it('should delete a company', async () => {
      // Arrange
      const company = await createTestCompany();

      // Act
      const response = await request(app).delete(
        `/companies/${company.company_id}`
      );

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(
        `/companies/${company.company_id}`
      );
      expect(getResponse.status).toBe(404);
    });
  });
});
