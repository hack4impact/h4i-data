import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a contact for tests
const createTestContact = async () => {
  const contactMutation = `
    mutation CreateContact($input: CreateContactInput!) {
      createContact(input: $input) {
        contact_id
      }
    }
  `;
  const contactVariables = {
    input: {
      name: 'Test Contact for Sponsor',
      email: `sponsor.contact.${Date.now()}@example.com`,
      phone_number: '123-456-7890',
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: contactMutation, variables: contactVariables });
  return response.body.data.createContact.contact_id;
};

// Helper to create a sponsor for tests
const createTestSponsor = async (contactId: string, name = 'Test Sponsor') => {
  const mutation = `
    mutation CreateSponsor($input: CreateSponsorInput!) {
      createSponsor(input: $input) {
        sponsor_id
        name
        contact_id
      }
    }
  `;
  const variables = {
    input: {
      name,
      contact_id: contactId,
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createSponsor;
};

describe('GraphQL API - Sponsors', () => {
  it('should create a new sponsor via mutation', async () => {
    // Arrange
    const contactId = await createTestContact();

    // Act
    const sponsor = await createTestSponsor(
      contactId,
      'GraphQL Integration Test Sponsor'
    );

    // Assert
    expect(sponsor).toHaveProperty('sponsor_id');
    expect(sponsor.name).toBe('GraphQL Integration Test Sponsor');
  });

  it('should fetch a sponsor by its ID via query', async () => {
    // Arrange
    const contactId = await createTestContact();
    const sponsor = await createTestSponsor(contactId, 'Sponsor for Fetch');

    // Act
    const query = `
      query Sponsor($id: ID!) {
        sponsor(id: $id) {
          sponsor_id
          name
        }
      }
    `;
    const variables = { id: sponsor.sponsor_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sponsor.sponsor_id).toBe(sponsor.sponsor_id);
    expect(response.body.data.sponsor.name).toBe('Sponsor for Fetch');
  });

  it('should fetch all sponsors via query', async () => {
    // Arrange
    const contactId = await createTestContact();
    await createTestSponsor(contactId, 'Sponsor for List');

    // Act
    const query = `query { sponsors { sponsor_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.sponsors)).toBe(true);
    expect(response.body.data.sponsors.length).toBeGreaterThan(0);
  });

  it('should update a sponsor via mutation', async () => {
    // Arrange
    const contactId = await createTestContact();
    const sponsor = await createTestSponsor(contactId, 'Sponsor for Update');

    // Act
    const mutation = `
      mutation UpdateSponsor($id: ID!, $input: UpdateSponsorInput!) {
        updateSponsor(id: $id, input: $input) {
          sponsor_id
          name
        }
      }
    `;
    const variables = {
      id: sponsor.sponsor_id,
      input: { name: 'Updated Sponsor Name' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateSponsor.name).toBe('Updated Sponsor Name');
  });

  it('should delete a sponsor via mutation', async () => {
    // Arrange
    const contactId = await createTestContact();
    const sponsor = await createTestSponsor(contactId, 'Sponsor for Delete');

    // Act
    const mutation = `
      mutation DeleteSponsor($id: ID!) {
        deleteSponsor(id: $id) {
          sponsor_id
        }
      }
    `;
    const variables = { id: sponsor.sponsor_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteSponsor.sponsor_id).toBe(
      sponsor.sponsor_id
    );
  });
});
