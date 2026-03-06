import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestUniversity = async (name: string) => {
  const mutation = `
    mutation CreateUniversity($input: CreateUniversityInput!) {
      createUniversity(input: $input) {
        university_id
        name
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables: { input: { name } } });
  return response.body.data.createUniversity;
};

describe('GraphQL API - Universities', () => {
  it('should create a new university via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateUniversity($input: CreateUniversityInput!) {
        createUniversity(input: $input) {
          university_id
          name
          email_domain
        }
      }
    `;
    const variables = {
      input: { name: 'Test University', email_domain: 'test.edu' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const university = response.body.data.createUniversity;
    expect(university).toHaveProperty('university_id');
    expect(university.name).toBe('Test University');
  });

  it('should fetch a university by ID via query', async () => {
    // Arrange
    const created = await createTestUniversity(
      `University ${Date.now()}.${Math.random()}`
    );

    // Act
    const query = `
      query University($id: ID!) {
        university(id: $id) {
          university_id
          name
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.university_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.university.university_id).toBe(
      created.university_id
    );
  });

  it('should return null for a non-existent university ID', async () => {
    // Act
    const query = `
      query {
        university(id: "00000000-0000-0000-0000-000000000000") {
          university_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.university).toBeNull();
  });

  it('should fetch all universities via query', async () => {
    // Arrange
    await createTestUniversity(`University ${Date.now()}.${Math.random()}`);

    // Act
    const query = `query { universities { university_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.universities)).toBe(true);
    expect(response.body.data.universities.length).toBeGreaterThan(0);
  });

  it('should update a university via mutation', async () => {
    // Arrange
    const created = await createTestUniversity(
      `University ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateUniversity($id: ID!, $input: UpdateUniversityInput!) {
        updateUniversity(id: $id, input: $input) {
          university_id
          name
          email_domain
        }
      }
    `;
    const variables = {
      id: created.university_id,
      input: { name: 'Updated University', email_domain: 'updated.edu' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateUniversity.name).toBe('Updated University');
    expect(response.body.data.updateUniversity.email_domain).toBe(
      'updated.edu'
    );
  });

  it('should return errors when updating a non-existent university', async () => {
    // Act
    const mutation = `
      mutation UpdateUniversity($id: ID!, $input: UpdateUniversityInput!) {
        updateUniversity(id: $id, input: $input) {
          university_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { name: 'Updated University' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid university input', async () => {
    // Arrange
    const created = await createTestUniversity(
      `University ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateUniversity($id: ID!, $input: UpdateUniversityInput!) {
        updateUniversity(id: $id, input: $input) {
          university_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.university_id, input: { name: 'X' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent university', async () => {
    // Act
    const mutation = `
      mutation DeleteUniversity($id: ID!) {
        deleteUniversity(id: $id) {
          university_id
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

  it('should delete a university via mutation', async () => {
    // Arrange
    const created = await createTestUniversity(
      `University ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation DeleteUniversity($id: ID!) {
        deleteUniversity(id: $id) {
          university_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.university_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteUniversity.university_id).toBe(
      created.university_id
    );

    // Verify it's gone
    const verifyQuery = `query { university(id: "${created.university_id}") { university_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.university).toBeNull();
  });
});
