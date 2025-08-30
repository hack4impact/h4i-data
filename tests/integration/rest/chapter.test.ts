import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { disconnectDB, prisma } from '../../../src/config/database';
import { env } from '../../../src/config/server';

// Hold the server instance to close it after tests
let server: Server;
let app: express.Application;

// Hold the ID of the chapter we create, so we can clean it up
let createdChapterId: string;

// beforeAll runs once before all tests in this file
beforeAll(() => {
  app = createRestApp();
  // Start the server on the port defined in .env.test
  server = app.listen(env.REST_PORT);
});

// afterAll runs once after all tests in this file
afterAll(async () => {
  // Clean up the database by deleting the created chapter
  if (createdChapterId) {
    await prisma.chapters.delete({ where: { chapter_id: createdChapterId } });
  }
  // Close the server and database connections
  server.close();
  await disconnectDB();
});

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
