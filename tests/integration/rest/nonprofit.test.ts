import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;

beforeAll(() => {
  app = createRestApp();
  server = app.listen(env.REST_PORT);
});

afterAll(() => {
  server.close();
});

describe('REST API - /nonprofits', () => {
  it('should create a new nonprofit via POST', async () => {
    const response = await request(server).post('/nonprofits').send({
      name: 'REST Integration Test Nonprofit',
      mission: 'Helping communities through REST testing',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('nonprofit_id');
    expect(response.body.name).toBe('REST Integration Test Nonprofit');
  });

  it('should create and fetch a nonprofit by its ID via GET', async () => {
    const createResponse = await request(server).post('/nonprofits').send({
      name: 'Test Nonprofit for Fetch',
      mission: 'Testing fetching a nonprofit',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    expect(createResponse.status).toBe(201);
    const nonprofitId = createResponse.body.nonprofit_id;

    const response = await request(server).get(`/nonprofits/${nonprofitId}`);

    expect(response.status).toBe(200);
    expect(response.body.nonprofit_id).toBe(nonprofitId);
    expect(response.body.name).toBe('Test Nonprofit for Fetch');
  });

  it('should update an existing nonprofit via PATCH', async () => {
    const createResponse = await request(server).post('/nonprofits').send({
      name: 'Updatable Nonprofit',
      mission: 'Initial mission',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    expect(createResponse.status).toBe(201);
    const nonprofitId = createResponse.body.nonprofit_id;

    const updateResponse = await request(server)
      .patch(`/nonprofits/${nonprofitId}`)
      .send({
        mission: 'Updated mission statement',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.mission).toBe('Updated mission statement');
  });

  it('should delete an existing nonprofit via DELETE', async () => {
    const createResponse = await request(server).post('/nonprofits').send({
      name: 'Deletable Nonprofit',
      mission: 'To be deleted',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    expect(createResponse.status).toBe(201);
    const nonprofitId = createResponse.body.nonprofit_id;

    const deleteResponse = await request(server).delete(
      `/nonprofits/${nonprofitId}`
    );
    expect(deleteResponse.status).toBe(204);

    // Verify it's gone
    const fetchResponse = await request(server).get(
      `/nonprofits/${nonprofitId}`
    );
    expect(fetchResponse.status).toBe(404);
  });

  it('should return 404 for a non-existent nonprofit ID', async () => {
    const response = await request(server).get(
      '/nonprofits/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });
});
