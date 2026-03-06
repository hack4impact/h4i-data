import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper function to create a constituent for tests
const createTestConstituent = async (email?: string) => {
  const mutation = `
    mutation CreateConstituent($input: CreateConstituentInput!) {
      createConstituent(input: $input) {
        constituent_id
        first_name
        last_name
        primary_email
      }
    }
  `;
  const uniqueEmail =
    email || `test.constituent.gql.${Date.now()}.${Math.random()}@example.com`;
  const variables = {
    input: {
      first_name: 'Test',
      last_name: 'User',
      primary_email: uniqueEmail,
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createConstituent;
};

describe('GraphQL API - Constituents', () => {
  it('should create a new constituent via mutation', async () => {
    // Arrange
    const uniqueEmail = `test.create.gql.${Date.now()}@example.com`;

    // Act
    const mutation = `
      mutation CreateConstituent($input: CreateConstituentInput!) {
        createConstituent(input: $input) {
          constituent_id
          first_name
          last_name
          primary_email
          phone_number
        }
      }
    `;
    const variables = {
      input: {
        first_name: 'Jane',
        last_name: 'Smith',
        primary_email: uniqueEmail,
        phone_number: '555-0100',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const constituent = response.body.data.createConstituent;
    expect(constituent.constituent_id).toBeDefined();
    expect(constituent.first_name).toBe('Jane');
    expect(constituent.primary_email).toBe(uniqueEmail);
  });

  it('should fetch a constituent by ID via query', async () => {
    // Arrange
    const created = await createTestConstituent();

    // Act
    const query = `
      query Constituent($id: ID!) {
        constituent(id: $id) {
          constituent_id
          first_name
          last_name
        }
      }
    `;
    const variables = { id: created.constituent_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.constituent.constituent_id).toBe(
      created.constituent_id
    );
  });

  it('should fetch all constituents', async () => {
    // Arrange
    await createTestConstituent();

    // Act
    const query = `query { constituents { constituent_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const constituents = response.body.data.constituents;
    expect(Array.isArray(constituents)).toBe(true);
    expect(constituents.length).toBeGreaterThan(0);
  });

  it('should return null for non-existent constituent', async () => {
    // Act
    const query = `
      query {
        constituent(id: "00000000-0000-0000-0000-000000000000") {
          constituent_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.constituent).toBeNull();
  });

  it('should update a constituent', async () => {
    // Arrange
    const created = await createTestConstituent();

    // Act
    const mutation = `
      mutation UpdateConstituent($id: ID!, $input: UpdateConstituentInput!) {
        updateConstituent(id: $id, input: $input) {
          constituent_id
          first_name
        }
      }
    `;
    const variables = {
      id: created.constituent_id,
      input: { first_name: 'Updated' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateConstituent.first_name).toBe('Updated');
  });

  it('should delete a constituent', async () => {
    // Arrange
    const created = await createTestConstituent();

    // Act
    const mutation = `
      mutation DeleteConstituent($id: ID!) {
        deleteConstituent(id: $id) {
          constituent_id
        }
      }
    `;
    const variables = { id: created.constituent_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteConstituent.constituent_id).toBe(
      created.constituent_id
    );
  });
});
