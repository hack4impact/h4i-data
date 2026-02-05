import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a company for tests
const createTestCompany = async (name = 'Test Co') => {
  const response = await request(app).post('/companies').send({ name });
  return response.body;
};

describe('REST API - /companies', () => {
  it('should create a new company via POST', async () => {
    // Act
    const company = await createTestCompany('REST Test Company');

    // Assert
    expect(company).toHaveProperty('company_id');
    expect(company.name).toBe('REST Test Company');
  });

  it('should fetch all companies via GET', async () => {
    // Arrange
    await createTestCompany('Company for List');

    // Act
    const response = await request(app).get('/companies');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should fetch a company by its ID via GET', async () => {
    // Arrange
    const company = await createTestCompany();

    // Act
    const response = await request(app).get(`/companies/${company.company_id}`);

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

  it('should return 400 for invalid data', async () => {
    // Act - empty name should be invalid
    const response = await request(app).post('/companies').send({ name: '' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should update a company via PATCH', async () => {
    // Arrange
    const company = await createTestCompany('Company for Update');

    // Act
    const response = await request(app)
      .patch(`/companies/${company.company_id}`)
      .send({ name: 'Updated Company Name' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Company Name');
  });

  it('should delete a company via DELETE', async () => {
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
