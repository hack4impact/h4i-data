import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

// Hold the server instance to close it after tests
let server: Server;
let app: express.Application;
let createdCompanyId: string;

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
    createdCompanyId = response.body.company_id;
  });

  it('should fetch a company by its ID via GET', async () => {
    // Now fetch it
    const response = await request(server).get(
      `/companies/${createdCompanyId}`
    );

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.company_id).toBe(createdCompanyId);
    expect(response.body.name).toBe('REST Integration Test Company');
  });

  it('should delete the company', async () => {
    const response = await request(server).delete(
      `/companies/${createdCompanyId}`
    );
    expect(response.status).toBe(204);
  });

  it('should return 404 for a non-existent company ID', async () => {
    const response = await request(server).get(
      `/companies/${createdCompanyId}`
    );
    expect(response.status).toBe(404);
  });
});
