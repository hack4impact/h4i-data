import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

describe('GraphQL API - Chapters', () => {
  it('should create a new chapter via mutation', async () => {
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
        name: 'GraphQL Integration Test Chapter',
        founded_date: '2025-08-30T12:00:00.000Z',
      },
    };

    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const chapter = response.body.data.createChapter;
    expect(chapter).toHaveProperty('chapter_id');
    expect(chapter.name).toBe('GraphQL Integration Test Chapter');
  });

  it('should create and fetch a chapter by its ID via query', async () => {
    // Create a chapter for this specific test
    const createMutation = `
      mutation CreateChapter($input: CreateChapterInput!) {
        createChapter(input: $input) {
          chapter_id
          name
          founded_date
        }
      }
    `;
    const createVariables = {
      input: {
        name: 'Test Chapter for Query',
        founded_date: '2025-08-30T12:00:00.000Z',
      },
    };

    const createResponse = await request(app)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    const chapterId = createResponse.body.data.createChapter.chapter_id;

    // Now fetch it
    const query = `
      query Chapter($id: ID!) {
        chapter(id: $id) {
          chapter_id
          name
        }
      }
    `;
    const variables = { id: chapterId };

    const response = await request(app).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const chapter = response.body.data.chapter;
    expect(chapter.chapter_id).toBe(chapterId);
    expect(chapter.name).toBe('Test Chapter for Query');
  });

  it('should fetch all chapters via query', async () => {
    // Create a chapter first
    const createMutation = `
      mutation CreateChapter($input: CreateChapterInput!) {
        createChapter(input: $input) {
          chapter_id
        }
      }
    `;
    await request(app)
      .post('/')
      .send({
        query: createMutation,
        variables: {
          input: {
            name: 'Chapter for List',
            founded_date: '2025-08-30T12:00:00.000Z',
          },
        },
      });

    // Fetch all chapters
    const query = `query { chapters { chapter_id name } }`;
    const response = await request(app).post('/').send({ query });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.chapters)).toBe(true);
    expect(response.body.data.chapters.length).toBeGreaterThan(0);
  });

  it('should update a chapter via mutation', async () => {
    // Create a chapter first
    const createMutation = `
      mutation CreateChapter($input: CreateChapterInput!) {
        createChapter(input: $input) {
          chapter_id
        }
      }
    `;
    const createResponse = await request(app)
      .post('/')
      .send({
        query: createMutation,
        variables: {
          input: {
            name: 'Chapter for Update',
            founded_date: '2025-08-30T12:00:00.000Z',
          },
        },
      });

    const chapterId = createResponse.body.data.createChapter.chapter_id;

    // Update it
    const updateMutation = `
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
        query: updateMutation,
        variables: {
          id: chapterId,
          input: { name: 'Updated Chapter Name' },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateChapter.name).toBe('Updated Chapter Name');
  });

  it('should delete a chapter via mutation', async () => {
    // Create a chapter first
    const createMutation = `
      mutation CreateChapter($input: CreateChapterInput!) {
        createChapter(input: $input) {
          chapter_id
        }
      }
    `;
    const createResponse = await request(app)
      .post('/')
      .send({
        query: createMutation,
        variables: {
          input: {
            name: 'Chapter for Delete',
            founded_date: '2025-08-30T12:00:00.000Z',
          },
        },
      });

    const chapterId = createResponse.body.data.createChapter.chapter_id;

    // Delete it
    const deleteMutation = `
      mutation DeleteChapter($id: ID!) {
        deleteChapter(id: $id) {
          chapter_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: deleteMutation,
        variables: { id: chapterId },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteChapter.chapter_id).toBe(chapterId);
  });
});
