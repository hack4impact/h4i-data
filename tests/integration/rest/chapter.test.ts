import request from 'supertest';
import { server } from './testServer';
import { prisma } from '../../../src/config/database';
import { startTestServer, closeTestServer } from './testServer';

// beforeAll runs once before all tests
beforeAll(() => {
  startTestServer();
});

// afterAll runs once after all tests
afterAll(async () => {
  // Clean up the database by deleting the created chapter
  if (createdChapterId) {
    await prisma.chapters.delete({ where: { chapter_id: createdChapterId } });
  }

  await closeTestServer();
});

// Hold the ID of the chapter we create, so we can clean it up
let createdChapterId: string;

describe('REST API - /chapters', () => {
  it('should create a new chapter via POST', async () => {
    const response = await request(server) // CHANGE: Use server, not app
      .post('/chapters')
      .send({
        name: 'REST Integration Test Chapter',
        founded_date: '2025-08-30T12:00:00.000Z',
      });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('chapter_id');
    expect(response.body.name).toBe('REST Integration Test Chapter');

    // Store the ID for cleanup and for the next test
    createdChapterId = response.body.chapter_id;
  });

  it('should fetch a chapter by its ID via GET', async () => {
    // This test relies on the chapter created in the previous test
    expect(createdChapterId).toBeDefined();

    const response = await request(server).get(`/chapters/${createdChapterId}`); // CHANGE: Use server, not app

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.chapter_id).toBe(createdChapterId);
    expect(response.body.name).toBe('REST Integration Test Chapter');
  });

  it('should return 404 for a non-existent chapter ID', async () => {
    const response = await request(server) // CHANGE: Use server, not app
      .get('/chapters/00000000-0000-0000-0000-000000000000');
    expect(response.status).toBe(404);
  });
});
