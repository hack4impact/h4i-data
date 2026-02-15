import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { env } from '../../../src/config/server';
// import { query } from 'winston';

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
  let chapterId: string;
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
          status_type
        }
      }
    `;
    const createVariables = {
      input: {
        name: 'Test Chapter for Query',
        founded_date: '2025-08-30T12:00:00.000Z',
        status_type: 'ACTIVE',
      },
    };

    const createResponse = await request(server)
      .post('/')
      .send({ query: createMutation, variables: createVariables });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();
    chapterId = createResponse.body.data.createChapter.chapter_id;

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
  //updateChapter
  it('updates a chapter name', async () => {
    const mutation = {
      query: `
      mutation Update($id: ID!, $input: UpdateChapterInput!) {
          updateChapter(id: $id, input: $input) { company_id name }
        }`,
      variables: {
        id: chapterId,
        input: {
          name: 'Test Chapter for Query Updated',
        },
      },
    };

    const res = await request(server).post('/').send(mutation);
    expect(res.status).toBe(200);
    expect(res.body.data.updateChapter.name).toBe(
      'Test Chapter for Query Updated'
    );
  });
  //deletes a chapter
  it('Deletes a chapter', async () => {
    const deleteMutation = {
      query: `mutation Delete($id: ID!) {deleteChapter(chapter_id: $id)}`,
      variables: { id: chapterId },
    };
    const res = await request(server).post('/').send(deleteMutation);
    expect(res.status).toBe(200);
    expect(res.body.data.deleteChapter).toBe(true);

    const verify = await request(server)
      .post('/')
      .send({
        query: `query($id: ID!) { chapter(chapter_id: $id) { chapter_id } }`,
        variables: { id: chapterId },
      });
    expect(verify.status).toBe(200);
    expect(verify.body.data.company).toBeNull();
  });
});
