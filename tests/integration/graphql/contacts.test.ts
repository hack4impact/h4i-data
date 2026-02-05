import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a contact for tests
const createTestContact = async (name = 'Test Contact') => {
  const mutation = `
    mutation CreateContact($input: CreateContactInput!) {
      createContact(input: $input) {
        contact_id
        name
        email
        phone_number
      }
    }
  `;
  const variables = {
    input: {
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}.${Date.now()}@example.com`,
      phone_number: '123-456-7890',
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createContact;
};

describe('GraphQL API - Contacts', () => {
  it('should create a new contact via mutation', async () => {
    // Act
    const contact = await createTestContact('GraphQL Integration Test Contact');

    // Assert
    expect(contact).toHaveProperty('contact_id');
    expect(contact.name).toBe('GraphQL Integration Test Contact');
  });

  it('should fetch a contact by its ID via query', async () => {
    // Arrange
    const contact = await createTestContact('Contact for Fetch');

    // Act
    const query = `
      query Contact($id: ID!) {
        contact(id: $id) {
          contact_id
          name
          email
        }
      }
    `;
    const variables = { id: contact.contact_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.contact.contact_id).toBe(contact.contact_id);
    expect(response.body.data.contact.name).toBe('Contact for Fetch');
  });

  it('should fetch all contacts via query', async () => {
    // Arrange
    await createTestContact('Contact for List');

    // Act
    const query = `query { contacts { contact_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.contacts)).toBe(true);
    expect(response.body.data.contacts.length).toBeGreaterThan(0);
  });

  it('should update a contact via mutation', async () => {
    // Arrange
    const contact = await createTestContact('Contact for Update');

    // Act
    const mutation = `
      mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
        updateContact(id: $id, input: $input) {
          contact_id
          name
        }
      }
    `;
    const variables = {
      id: contact.contact_id,
      input: { name: 'Updated Contact Name' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateContact.name).toBe('Updated Contact Name');
  });

  it('should delete a contact by its ID via mutation', async () => {
    // Arrange
    const contact = await createTestContact('Contact for Delete');

    // Act
    const mutation = `
      mutation DeleteContact($id: ID!) {
        deleteContact(id: $id) {
          contact_id
        }
      }
    `;
    const variables = { id: contact.contact_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteContact).toHaveProperty(
      'contact_id',
      contact.contact_id
    );
  });
});
