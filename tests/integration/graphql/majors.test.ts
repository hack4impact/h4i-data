import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestMajor = async (name: string) => {
  const mutation = `
    mutation CreateMajor($input: CreateMajorInput!) {
      createMajor(input: $input) {
        major_id
        name
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables: { input: { name } } });
  return response.body.data.createMajor;
};

describe('GraphQL API - Majors', () => {
  it('should create a new major via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateMajor($input: CreateMajorInput!) {
        createMajor(input: $input) {
          major_id
          name
        }
      }
    `;
    const variables = { input: { name: 'Computer Science' } };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const major = response.body.data.createMajor;
    expect(major).toHaveProperty('major_id');
    expect(major.name).toBe('Computer Science');
  });

  it('should fetch a major by ID via query', async () => {
    // Arrange
    const created = await createTestMajor(
      `Major ${Date.now()}.${Math.random()}`
    );

    // Act
    const query = `
      query Major($id: ID!) {
        major(id: $id) {
          major_id
          name
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.major_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.major.major_id).toBe(created.major_id);
  });

  it('should return null for a non-existent major ID', async () => {
    // Act
    const query = `
      query {
        major(id: "00000000-0000-0000-0000-000000000000") {
          major_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.major).toBeNull();
  });

  it('should fetch all majors via query', async () => {
    // Arrange
    await createTestMajor(`Major ${Date.now()}.${Math.random()}`);

    // Act
    const query = `query { majors { major_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.majors)).toBe(true);
    expect(response.body.data.majors.length).toBeGreaterThan(0);
  });

  it('should update a major via mutation', async () => {
    // Arrange
    const created = await createTestMajor(
      `Major ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateMajor($id: ID!, $input: UpdateMajorInput!) {
        updateMajor(id: $id, input: $input) {
          major_id
          name
        }
      }
    `;
    const variables = {
      id: created.major_id,
      input: { name: 'Updated Major' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateMajor.name).toBe('Updated Major');
  });

  it('should return errors when updating a non-existent major', async () => {
    // Act
    const mutation = `
      mutation UpdateMajor($id: ID!, $input: UpdateMajorInput!) {
        updateMajor(id: $id, input: $input) {
          major_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { name: 'Updated Major' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid major input', async () => {
    // Arrange
    const created = await createTestMajor(
      `Major ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateMajor($id: ID!, $input: UpdateMajorInput!) {
        updateMajor(id: $id, input: $input) {
          major_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.major_id, input: { name: 'X' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent major', async () => {
    // Act
    const mutation = `
      mutation DeleteMajor($id: ID!) {
        deleteMajor(id: $id) {
          major_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: '00000000-0000-0000-0000-000000000000' },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should delete a major via mutation', async () => {
    // Arrange
    const created = await createTestMajor(
      `Major ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation DeleteMajor($id: ID!) {
        deleteMajor(id: $id) {
          major_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.major_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteMajor.major_id).toBe(created.major_id);

    // Verify it's gone
    const verifyQuery = `query { major(id: "${created.major_id}") { major_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.major).toBeNull();
  });
});
