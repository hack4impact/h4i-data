import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

const createTestAcademicTerm = async (name: string) => {
  const mutation = `
    mutation CreateAcademicTerm($input: CreateAcademicTermInput!) {
      createAcademicTerm(input: $input) {
        term_id
        name
        type
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: { input: { name, type: 'SEMESTER' } },
    });
  return response.body.data.createAcademicTerm;
};

describe('GraphQL API - Academic Terms', () => {
  it('should create a new academic term via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateAcademicTerm($input: CreateAcademicTermInput!) {
        createAcademicTerm(input: $input) {
          term_id
          name
          type
        }
      }
    `;
    const variables = { input: { name: 'Fall 2025', type: 'SEMESTER' } };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const term = response.body.data.createAcademicTerm;
    expect(term).toHaveProperty('term_id');
    expect(term.name).toBe('Fall 2025');
    expect(term.type).toBe('SEMESTER');
  });

  it('should fetch an academic term by ID via query', async () => {
    // Arrange
    const created = await createTestAcademicTerm(`Term ${Date.now()}`);

    // Act
    const query = `
      query AcademicTerm($id: ID!) {
        academicTerm(id: $id) {
          term_id
          name
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.term_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.academicTerm.term_id).toBe(created.term_id);
  });

  it('should return null for a non-existent academic term ID', async () => {
    // Act
    const query = `
      query {
        academicTerm(id: "00000000-0000-0000-0000-000000000000") {
          term_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.academicTerm).toBeNull();
  });

  it('should fetch all academic terms via query', async () => {
    // Arrange
    await createTestAcademicTerm(`Term ${Date.now()}`);

    // Act
    const query = `query { academicTerms { term_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.academicTerms)).toBe(true);
    expect(response.body.data.academicTerms.length).toBeGreaterThan(0);
  });

  it('should update an academic term via mutation', async () => {
    // Arrange
    const created = await createTestAcademicTerm(`Term ${Date.now()}`);

    // Act
    const mutation = `
      mutation UpdateAcademicTerm($id: ID!, $input: UpdateAcademicTermInput!) {
        updateAcademicTerm(id: $id, input: $input) {
          term_id
          name
          type
        }
      }
    `;
    const variables = {
      id: created.term_id,
      input: { name: 'Spring 2026', type: 'QUARTER' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateAcademicTerm.name).toBe('Spring 2026');
    expect(response.body.data.updateAcademicTerm.type).toBe('QUARTER');
  });

  it('should delete an academic term via mutation', async () => {
    // Arrange
    const created = await createTestAcademicTerm(`Term ${Date.now()}`);

    // Act
    const mutation = `
      mutation DeleteAcademicTerm($id: ID!) {
        deleteAcademicTerm(id: $id) {
          term_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.term_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteAcademicTerm.term_id).toBe(created.term_id);

    // Verify it's gone
    const verifyQuery = `query { academicTerm(id: "${created.term_id}") { term_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.academicTerm).toBeNull();
  });
});
