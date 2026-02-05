import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a contact for tests
const createTestContact = async (name = 'Test Contact') => {
  const response = await request(app)
    .post('/contacts')
    .send({
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}.${Date.now()}@example.com`,
    });
  return response.body;
};

describe('REST API - /contacts', () => {
  it('should create a new contact via POST', async () => {
    // Act
    const response = await request(app)
      .post('/contacts')
      .send({
        name: 'REST Integration Test Contact',
        email: `contact.${Date.now()}@example.com`,
      });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('contact_id');
    expect(response.body.name).toBe('REST Integration Test Contact');
  });

  it('should fetch all contacts via GET', async () => {
    // Arrange
    await createTestContact('Contact for List');

    // Act
    const response = await request(app).get('/contacts');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should fetch a contact by its ID via GET', async () => {
    // Arrange
    const contact = await createTestContact('Contact for Fetch');

    // Act
    const response = await request(app).get(`/contacts/${contact.contact_id}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.contact_id).toBe(contact.contact_id);
    expect(response.body.name).toBe('Contact for Fetch');
  });

  it('should return 404 for a non-existent contact ID', async () => {
    // Act
    const response = await request(app).get(
      '/contacts/00000000-0000-0000-0000-000000000000'
    );

    // Assert
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    // Act - missing required email field
    const response = await request(app).post('/contacts').send({
      name: 'Invalid Contact',
    });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should update a contact via PATCH', async () => {
    // Arrange
    const contact = await createTestContact('Contact for Update');

    // Act
    const response = await request(app)
      .patch(`/contacts/${contact.contact_id}`)
      .send({ name: 'Updated Contact Name' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Contact Name');
  });

  it('should delete a contact via DELETE', async () => {
    // Arrange
    const contact = await createTestContact('Contact for Delete');

    // Act
    const response = await request(app).delete(
      `/contacts/${contact.contact_id}`
    );

    // Assert
    expect(response.status).toBe(204);

    // Verify deletion
    const getResponse = await request(app).get(
      `/contacts/${contact.contact_id}`
    );
    expect(getResponse.status).toBe(404);
  });
});
