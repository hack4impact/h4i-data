import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a chapter for tests
const createTestChapter = async (name: string) => {
  const mutation = `
    mutation CreateChapter($input: CreateChapterInput!) {
      createChapter(input: $input) {
        chapter_id
        name
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: { input: { name, founded_date: '2025-08-30T12:00:00.000Z' } },
    });
  return response.body.data.createChapter;
};

describe('GraphQL API - Chapters', () => {
  it('should create a new chapter via mutation', async () => {
    // Act
    const mutation = `
      mutation CreateChapter($input: CreateChapterInput!) {
        createChapter(input: $input) {
          chapter_id
          name
          founded_date
        }
      }
    `;
    const variables = {
      input: {
        name: `Test Chapter ${Date.now()}.${Math.random()}`,
        founded_date: '2025-08-30T12:00:00.000Z',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const chapter = response.body.data.createChapter;
    expect(chapter).toHaveProperty('chapter_id');
  });

  it('should fetch a chapter by ID via query', async () => {
    // Arrange
    const created = await createTestChapter(
      `Test Chapter ${Date.now()}.${Math.random()}`
    );

    // Act
    const query = `
      query Chapter($id: ID!) {
        chapter(id: $id) {
          chapter_id
          name
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.chapter_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.chapter.chapter_id).toBe(created.chapter_id);
  });

  it('should return null for a non-existent chapter ID', async () => {
    // Act
    const query = `
      query {
        chapter(id: "00000000-0000-0000-0000-000000000000") {
          chapter_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.chapter).toBeNull();
  });

  it('should fetch all chapters via query', async () => {
    // Arrange
    await createTestChapter(`Test Chapter ${Date.now()}.${Math.random()}`);

    // Act
    const query = `query { chapters { chapter_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.chapters)).toBe(true);
    expect(response.body.data.chapters.length).toBeGreaterThan(0);
  });

  it('should update a chapter via mutation', async () => {
    // Arrange
    const created = await createTestChapter(
      `Test Chapter ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateChapter($id: ID!, $input: UpdateChapterInput!) {
        updateChapter(id: $id, input: $input) {
          chapter_id
          name
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: created.chapter_id,
          input: { name: 'Updated Chapter Name' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateChapter.name).toBe('Updated Chapter Name');
  });

  it('should return errors when updating a non-existent chapter', async () => {
    // Act
    const mutation = `
      mutation UpdateChapter($id: ID!, $input: UpdateChapterInput!) {
        updateChapter(id: $id, input: $input) {
          chapter_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { name: 'Updated' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid chapter input', async () => {
    // Arrange
    const created = await createTestChapter(
      `Test Chapter ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation UpdateChapter($id: ID!, $input: UpdateChapterInput!) {
        updateChapter(id: $id, input: $input) {
          chapter_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.chapter_id, input: { name: '' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent chapter', async () => {
    // Act
    const mutation = `
      mutation DeleteChapter($id: ID!) {
        deleteChapter(id: $id) {
          chapter_id
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

  it('should delete a chapter via mutation', async () => {
    // Arrange
    const created = await createTestChapter(
      `Test Chapter ${Date.now()}.${Math.random()}`
    );

    // Act
    const mutation = `
      mutation DeleteChapter($id: ID!) {
        deleteChapter(id: $id) {
          chapter_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.chapter_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteChapter.chapter_id).toBe(
      created.chapter_id
    );

    // Verify deletion
    const verifyQuery = `
      query {
        chapter(id: "${created.chapter_id}") {
          chapter_id
        }
      }
    `;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.chapter).toBeNull();
  });
});
