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
      name: 'Test Contact for Nonprofit',
      email: `nonprofit.contact.${Date.now()}@example.com`,
      phone_number: '123-456-7890',
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: contactMutation, variables: contactVariables });
  return response.body.data.createContact.contact_id;
};

// Helper to create a nonprofit for tests
const createTestNonprofit = async (
  contactId: string,
  name = 'Test Nonprofit'
) => {
  const mutation = `
    mutation CreateNonprofit($input: CreateNonprofitInput!) {
      createNonprofit(input: $input) {
        nonprofit_id
        name
        mission
        website
        contact_id
      }
    }
  `;
  const variables = {
    input: {
      name,
      mission: 'This is a test mission for nonprofit',
      website: 'https://example.org',
      contact_id: contactId,
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createNonprofit;
};

describe('GraphQL API - Nonprofits', () => {
  it('should create a new nonprofit via mutation', async () => {
    // Arrange
    const contactId = await createTestContact();

    // Act
    const nonprofit = await createTestNonprofit(
      contactId,
      'GraphQL Integration Test Nonprofit'
    );

    // Assert
    expect(nonprofit).toHaveProperty('nonprofit_id');
    expect(nonprofit.name).toBe('GraphQL Integration Test Nonprofit');
  });

  it('should fetch a nonprofit by its ID via query', async () => {
    // Arrange
    const contactId = await createTestContact();
    const nonprofit = await createTestNonprofit(
      contactId,
      'Nonprofit for Fetch'
    );

    // Act
    const query = `
      query Nonprofit($id: ID!) {
        nonprofit(id: $id) {
          nonprofit_id
          name
          mission
        }
      }
    `;
    const variables = { id: nonprofit.nonprofit_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.nonprofit.nonprofit_id).toBe(
      nonprofit.nonprofit_id
    );
    expect(response.body.data.nonprofit.name).toBe('Nonprofit for Fetch');
  });

  it('should fetch all nonprofits via query', async () => {
    // Arrange
    const contactId = await createTestContact();
    await createTestNonprofit(contactId, 'Nonprofit for List');

    // Act
    const query = `query { nonprofits { nonprofit_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.nonprofits)).toBe(true);
    expect(response.body.data.nonprofits.length).toBeGreaterThan(0);
  });

  it('should update a nonprofit via mutation', async () => {
    // Arrange
    const contactId = await createTestContact();
    const nonprofit = await createTestNonprofit(
      contactId,
      'Nonprofit for Update'
    );

    // Act
    const mutation = `
      mutation UpdateNonprofit($id: ID!, $input: UpdateNonprofitInput!) {
        updateNonprofit(id: $id, input: $input) {
          nonprofit_id
          mission
        }
      }
    `;
    const variables = {
      id: nonprofit.nonprofit_id,
      input: { mission: 'Updated mission statement' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateNonprofit.mission).toBe(
      'Updated mission statement'
    );
  });

  it('should delete a nonprofit via mutation', async () => {
    // Arrange
    const contactId = await createTestContact();
    const nonprofit = await createTestNonprofit(
      contactId,
      'Nonprofit for Delete'
    );

    // Act
    const mutation = `
      mutation DeleteNonprofit($id: ID!) {
        deleteNonprofit(id: $id) {
          nonprofit_id
        }
      }
    `;
    const variables = { id: nonprofit.nonprofit_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteNonprofit).toHaveProperty(
      'nonprofit_id',
      nonprofit.nonprofit_id
    );
  });
});
