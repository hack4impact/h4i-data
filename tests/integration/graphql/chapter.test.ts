import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { disconnectDB, prisma } from '../../../src/config/database';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let createdChapterId: string;

beforeAll(() => {
  app = createGraphqlApp();
  server = app.listen(env.GRAPHQL_PORT);
});

afterAll(async () => {
  if (createdChapterId) {
    await prisma.chapters.delete({ where: { chapter_id: createdChapterId } });
  }
  server.close();
  await disconnectDB();
});

describe('GraphQL API - Chapters', () => {
  it('should create a new chapter via mutation', async () => {
    const mutation = `
      mutation CreateChapter($input: CreateChapterInput!) {
        createChapter(input: $input) {
          chapter_id
          name
          status_type
        }
      }
    `;
    const variables = {
      input: {
        name: 'GraphQL Integration Test Chapter',
        founded_date: '2025-08-30T12:00:00.000Z',
        status_type: 'ACTIVE',
      },
    };

    const response = await request(server) // CHANGE: Use server, not app
      .post('/') // GraphQL server is at the root
      .send({ query: mutation, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const chapter = response.body.data.createChapter;
    expect(chapter).toHaveProperty('chapter_id');
    expect(chapter.name).toBe('GraphQL Integration Test Chapter');

    createdChapterId = chapter.chapter_id;
  });

  it('should fetch a chapter by its ID via query', async () => {
    expect(createdChapterId).toBeDefined();

    const query = `
      query Chapter($id: ID!) {
        chapter(id: $id) {
          chapter_id
          name
        }
      }
    `;
    const variables = { id: createdChapterId };

    const response = await request(server) // CHANGE: Use server, not app
      .post('/')
      .send({ query, variables });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const chapter = response.body.data.chapter;
    expect(chapter.chapter_id).toBe(createdChapterId);
  });
});
