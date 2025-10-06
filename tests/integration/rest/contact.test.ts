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

describe('REST API - /contacts', () => {
  it('should create a new contact via POST', async () => {
    const response = await request(server).post('/contacts').send({
      name: 'REST Integration Test Contact',
      email: 'contact@example.com',
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('contact_id');
    expect(response.body.name).toBe('REST Integration Test Contact');
  });

  it('should create and fetch a contact by its ID via GET', async () => {
    // Create a contact for this specific test
    const createResponse = await request(server).post('/contacts').send({
      name: 'Test Contact for Fetch',
      email: 'fetchcontact@example.com',
    });

    expect(createResponse.status).toBe(201);
    const contactId = createResponse.body.contact_id;

    // Now fetch it
    const response = await request(server).get(`/contacts/${contactId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.contact_id).toBe(contactId);
    expect(response.body.name).toBe('Test Contact for Fetch');
  });

  it('should return 404 for a non-existent contact ID', async () => {
    const response = await request(server).get(
      '/contacts/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });
});
