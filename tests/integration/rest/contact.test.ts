import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

// Hold the server instance to close it after tests
let server: Server;
let app: express.Application;
let createdContactId: string;

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
    createdContactId = response.body.contact_id;
  });

  it('should fetch a contact by its ID via GET', async () => {
    // Now fetch it
    const response = await request(server).get(`/contacts/${createdContactId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.contact_id).toBe(createdContactId);
    expect(response.body.name).toBe('REST Integration Test Contact');
  });

  it('should delete the contact', async () => {
    const response = await request(server).delete(
      `/contacts/${createdContactId}`
    );
    expect(response.status).toBe(204);
  });

  it('should return 404 for a non-existent contact ID', async () => {
    const response = await request(server).get(`/contacts/${createdContactId}`);
    expect(response.status).toBe(404);
  });
});
