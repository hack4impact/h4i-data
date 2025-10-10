import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let contactId: string;

beforeAll(async () => {
  app = createRestApp();
  server = app.listen(env.REST_PORT);

  // create a contact id to associate with the nonprofit
  const createResponse = await request(server).post('/contacts').send({
    name: 'Test Contact for Fetch',
    email: 'fetchcontact@example.com',
  });

  expect(createResponse.status).toBe(201);
  contactId = createResponse.body.contact_id;
});

afterAll(() => {
  server.close();
});

describe('REST API - /nonprofits', () => {
  it('should create a new nonprofit via POST', async () => {
    const response = await request(server).post('/nonprofits').send({
      name: 'REST Integration Test Nonprofit',
      mission: 'Helping communities through REST testing',
      website: 'https://example.org',
      contact_id: contactId,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('nonprofit_id');
    expect(response.body.name).toBe('REST Integration Test Nonprofit');
  });

  it('should return validation error (400) if required fields are missing', async () => {
    // Missing 'contact_id' and other required fields
    const response = await request(server).post('/nonprofits').send({
      name: 'Invalid Nonprofit',
      mission: 'Too short',
    });

    expect(response.status).toBe(400);
  });

  it('should create and fetch a nonprofit by its ID via GET', async () => {
    const createResponse = await request(server).post('/nonprofits').send({
      name: 'Test Nonprofit for Fetch',
      mission: 'Testing fetching a nonprofit by ID',
      website: 'https://fetch.org',
      contact_id: contactId,
    });

    expect(createResponse.status).toBe(201);
    const nonprofitId = createResponse.body.nonprofit_id;

    const response = await request(server).get(`/nonprofits/${nonprofitId}`);

    expect(response.status).toBe(200);
    expect(response.body.nonprofit_id).toBe(nonprofitId);
    expect(response.body.name).toBe('Test Nonprofit for Fetch');
  });

  it('should fetch all nonprofits via GET /nonprofits', async () => {
    const response = await request(server).get('/nonprofits');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('nonprofit_id');
    }
  });

  it('should update an existing nonprofit via PATCH', async () => {
    const createResponse = await request(server).post('/nonprofits').send({
      name: 'Updatable Nonprofit',
      mission: 'Initial mission',
      contact_id: contactId,
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
      mission: 'To be deleted soon',
      contact_id: contactId,
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

  it('should return 404 when updating a non-existent nonprofit', async () => {
    const response = await request(server)
      .patch('/nonprofits/00000000-0000-0000-0000-000000000000')
      .send({ mission: 'Will not work' });

    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existent nonprofit', async () => {
    const response = await request(server).delete(
      '/nonprofits/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });

  it('should return 404 for a non-existent nonprofit ID via GET', async () => {
    const response = await request(server).get(
      '/nonprofits/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });
});
