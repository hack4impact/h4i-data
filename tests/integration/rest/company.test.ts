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

describe('REST API - /companies', () => {
  it('should create a new company via POST', async () => {
    const response = await request(server).post('/companies').send({
      name: 'REST Integration Test Company',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('company_id');
    expect(response.body.name).toBe('REST Integration Test Company');
  });

  it('should create and fetch a company by its ID via GET', async () => {
    // Create a company for this specific test
    const createResponse = await request(server).post('/companies').send({
      name: 'Test Company for Fetch',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    expect(createResponse.status).toBe(201);
    const companyId = createResponse.body.company_id;

    // Now fetch it
    const response = await request(server).get(`/companies/${companyId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.company_id).toBe(companyId);
    expect(response.body.name).toBe('Test Company for Fetch');
  });

  it('should return 404 for a non-existent company ID', async () => {
    const response = await request(server).get(
      '/companies/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });
});
