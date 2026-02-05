import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a contact for tests
const createTestContact = async () => {
  const response = await request(app)
    .post('/contacts')
    .send({
      name: 'Integration Contact',
      email: `sponsor.contact.${Date.now()}@example.com`,
    });
  return response.body.contact_id;
};

// Helper to create a sponsor for tests
const createTestSponsor = async (contactId: string, name = 'Test Sponsor') => {
  const response = await request(app).post('/sponsors').send({
    name,
    contact_id: contactId,
    founded_date: '2025-08-30T12:00:00.000Z',
  });
  return response.body;
};

describe('REST API - /sponsors', () => {
  it('should create a new sponsor via POST', async () => {
    // Arrange
    const contactId = await createTestContact();

    // Act
    const response = await request(app).post('/sponsors').send({
      name: 'REST Integration Test Sponsor',
      contact_id: contactId,
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('sponsor_id');
    expect(response.body.name).toBe('REST Integration Test Sponsor');
  });

  it('should return 400 for invalid data', async () => {
    // Act - missing required contact_id
    const response = await request(app).post('/sponsors').send({
      name: 'Invalid Sponsor',
    });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should fetch all sponsors via GET', async () => {
    // Arrange
    const contactId = await createTestContact();
    await createTestSponsor(contactId, 'Sponsor for List');

    // Act
    const response = await request(app).get('/sponsors');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should fetch a sponsor by its ID via GET', async () => {
    // Arrange
    const contactId = await createTestContact();
    const sponsor = await createTestSponsor(contactId, 'Sponsor for Fetch');

    // Act
    const response = await request(app).get(`/sponsors/${sponsor.sponsor_id}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.sponsor_id).toBe(sponsor.sponsor_id);
    expect(response.body.name).toBe('Sponsor for Fetch');
  });

  it('should return 404 for a non-existent sponsor ID', async () => {
    // Act
    const response = await request(app).get(
      '/sponsors/00000000-0000-0000-0000-000000000000'
    );

    // Assert
    expect(response.status).toBe(404);
  });

  it('should update a sponsor via PATCH', async () => {
    // Arrange
    const contactId = await createTestContact();
    const sponsor = await createTestSponsor(contactId, 'Sponsor for Update');

    // Act
    const response = await request(app)
      .patch(`/sponsors/${sponsor.sponsor_id}`)
      .send({ name: 'Updated Sponsor Name' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Sponsor Name');
  });

  it('should delete a sponsor via DELETE', async () => {
    // Arrange
    const contactId = await createTestContact();
    const sponsor = await createTestSponsor(contactId, 'Sponsor for Delete');

    // Act
    const response = await request(app).delete(
      `/sponsors/${sponsor.sponsor_id}`
    );

    // Assert
    expect(response.status).toBe(204);

    // Verify deletion
    const getResponse = await request(app).get(
      `/sponsors/${sponsor.sponsor_id}`
    );
    expect(getResponse.status).toBe(404);
  });
});
