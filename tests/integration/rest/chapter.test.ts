import request from 'supertest';
import { createRestApp } from '../../../api/rest/server';
import { prisma } from '../../../config/database';

const app = createRestApp();

describe('REST API - /api/rest/chapters', () => {
  let createdChapterId: string;

  // Clean up the created chapter after all tests
  afterAll(async () => {
    if (createdChapterId) {
      await prisma.chapters.delete({ where: { chapter_id: createdChapterId } });
    }
    await prisma.$disconnect();
  });

  it('POST /chapters - should create a new chapter', async () => {
    const newChapterData = {
      name: 'Integration Test Chapter',
      founded_date: '2024-08-30',
    };

    const res = await request(app).post('/chapters').send(newChapterData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('chapter_id');
    expect(res.body.name).toBe(newChapterData.name);

    createdChapterId = res.body.chapter_id; // Save for cleanup
  });

  it('GET /chapters - should return a list of chapters', async () => {
    const res = await request(app).get('/chapters');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /chapters/:id - should return a single chapter', async () => {
    const res = await request(app).get(`/chapters/${createdChapterId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.chapter_id).toBe(createdChapterId);
  });
});
