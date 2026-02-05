import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
});

afterAll(() => {
  server.close();
});

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

    const response = await request(server)
      .post('/') // GraphQL server is at the root
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

    const createResponse = await request(server)
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

    const response = await request(server).post('/').send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const chapter = response.body.data.chapter;
    expect(chapter.chapter_id).toBe(chapterId);
    expect(chapter.name).toBe('Test Chapter for Query');
  });
});
