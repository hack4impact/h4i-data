import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

// Hold the server instance to close it after tests
let server: Server;
let app: express.Application;

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

describe('REST API - /projects', () => {
  it('should create a new project via POST', async () => {
    const response = await request(server).post('/projects').send({
      name: 'REST Integration Test Project',
      repo: 'REPO URL',
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('project_id');
    expect(response.body.name).toBe('REST Integration Test Project');
    expect(response.body.repo).toBe('REPO URL');
  });

  it('should create and fetch a project by its ID via GET', async () => {
    // Create a project for this test
    const createResponse = await request(server).post('/projects').send({
      name: 'REST Integration Test Project',
      repo: 'REPO URL',
    });

    expect(createResponse.status).toBe(201);
    const projectId = createResponse.body.project_id;

    // Fetch project
    const response = await request(server).get(`/projects/${projectId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.project_id).toBe(projectId);
    expect(response.body.name).toBe('REST Integration Test Project');
  });

  it('should return 404 for a non-existent project ID', async () => {
    const response = await request(server).get(
      '/projects/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });
});
