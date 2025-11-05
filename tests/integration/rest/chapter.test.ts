import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

// Hold the server instance to close it after tests
let server: Server;
let app: express.Application;
let chapterId: string;

// beforeAll runs once before all tests in this file
beforeAll(() => {
  app = createRestApp();
  // Start the server on the port defined in .env.test
  server = app.listen(env.REST_PORT);
});

// afterAll runs once after all tests in this file
afterAll(() => {
  // Close the server
  server.close();
});

describe('REST API - /chapters', () => {
  it('should create a new chapter via POST', async () => {
    const response = await request(server).post('/chapters').send({
      name: 'REST Integration Test Chapter',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('chapter_id');
    expect(response.body.name).toBe('REST Integration Test Chapter');

    chapterId = response.body.chapter_id;
  });

  it('should return 404 for a non-existent chapter ID', async () => {
    const response = await request(server).get(`/chapters/${chapterId}`);
    expect(response.status).toBe(404);
  });
});
