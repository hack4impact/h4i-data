import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a contact for tests
const createTestContact = async () => {
  const response = await request(app)
    .post('/contacts')
    .send({
      name: 'Test Contact for Nonprofit',
      email: `nonprofit.contact.${Date.now()}@example.com`,
    });
  return response.body.contact_id;
};

// Helper to create a nonprofit for tests
const createTestNonprofit = async (
  contactId: string,
  name = 'Test Nonprofit'
) => {
  const response = await request(app).post('/nonprofits').send({
    name,
    mission: 'Helping communities through testing',
    website: 'https://example.org',
    contact_id: contactId,
  });
  return response.body;
};

describe('REST API - /nonprofits', () => {
  it('should create a new nonprofit via POST', async () => {
    // Arrange
    const contactId = await createTestContact();

    // Act
    const response = await request(app).post('/nonprofits').send({
      name: 'REST Integration Test Nonprofit',
      mission: 'Helping communities through REST testing',
      website: 'https://example.org',
      contact_id: contactId,
    });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('nonprofit_id');
    expect(response.body.name).toBe('REST Integration Test Nonprofit');
  });

  it('should return 400 for invalid data', async () => {
    // Act - missing contact_id and other required fields
    const response = await request(app).post('/nonprofits').send({
      name: 'Invalid Nonprofit',
      mission: 'Too short',
    });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should fetch all nonprofits via GET', async () => {
    // Arrange
    const contactId = await createTestContact();
    await createTestNonprofit(contactId, 'Nonprofit for List');

    // Act
    const response = await request(app).get('/nonprofits');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('nonprofit_id');
    }
  });

  it('should fetch a nonprofit by its ID via GET', async () => {
    // Arrange
    const contactId = await createTestContact();
    const nonprofit = await createTestNonprofit(
      contactId,
      'Nonprofit for Fetch'
    );

    // Act
    const response = await request(app).get(
      `/nonprofits/${nonprofit.nonprofit_id}`
    );

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.nonprofit_id).toBe(nonprofit.nonprofit_id);
    expect(response.body.name).toBe('Nonprofit for Fetch');
  });

  it('should return 404 for a non-existent nonprofit ID', async () => {
    // Act
    const response = await request(app).get(
      '/nonprofits/00000000-0000-0000-0000-000000000000'
    );

    // Assert
    expect(response.status).toBe(404);
  });

  it('should update a nonprofit via PATCH', async () => {
    // Arrange
    const contactId = await createTestContact();
    const nonprofit = await createTestNonprofit(
      contactId,
      'Nonprofit for Update'
    );

    // Act
    const response = await request(app)
      .patch(`/nonprofits/${nonprofit.nonprofit_id}`)
      .send({ mission: 'Updated mission statement' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.mission).toBe('Updated mission statement');
  });

  it('should delete a nonprofit via DELETE', async () => {
    // Arrange
    const contactId = await createTestContact();
    const nonprofit = await createTestNonprofit(
      contactId,
      'Nonprofit for Delete'
    );

    // Act
    const response = await request(app).delete(
      `/nonprofits/${nonprofit.nonprofit_id}`
    );

    // Assert
    expect(response.status).toBe(204);

    // Verify deletion
    const getResponse = await request(app).get(
      `/nonprofits/${nonprofit.nonprofit_id}`
    );
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 when updating a non-existent nonprofit', async () => {
    const response = await request(app)
      .patch('/nonprofits/00000000-0000-0000-0000-000000000000')
      .send({ mission: 'Will not work' });

    expect(response.status).toBe(404);
  });
});
