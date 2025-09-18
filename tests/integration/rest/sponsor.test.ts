import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';
import { prisma } from '../../../src/config/database';

// Hold the server instance to close it after tests
let server: Server;
let app: express.Application;
let contactId: string;

// beforeAll runs once before all tests in this file
beforeAll(async () => {
  app = createRestApp();
  // Start the server on the port defined in .env.test
  server = app.listen(env.REST_PORT);

  const contact = await prisma.contacts.create({
    data: {
      name: 'Integration Contact',
      email: `int-${Date.now()}@example.com`,
      // phone_number: '1234567890', // optional
    },
  });
  contactId = contact.contact_id;
});

// afterAll runs once after all tests in this file
afterAll(async () => {
  await prisma.sponsors.deleteMany({ where: { contact_id: contactId } });
  await prisma.contacts.delete({ where: { contact_id: contactId } });
  // Close the server
  server.close();
});

describe('REST API - /sponsors', () => {
  it('should create a new sponsor via POST', async () => {
    const response = await request(server).post('/sponsors').send({
      name: 'REST Integration Test Sponsor',
      contact_id: contactId,
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('sponsor_id');
    expect(response.body.name).toBe('REST Integration Test Sponsor');
  });

  it('should create and fetch a sponsor by its ID via GET', async () => {
    // Create a sponsor for this specific test
    const createResponse = await request(server).post('/sponsors').send({
      name: 'Test Sponsor for Fetch',
      contact_id: contactId,
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    expect(createResponse.status).toBe(201);
    const sponsorId = createResponse.body.sponsor_id;

    // Now fetch it
    const response = await request(server).get(`/sponsors/${sponsorId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.sponsor_id).toBe(sponsorId);
    expect(response.body.name).toBe('Test Sponsor for Fetch');
  });

  it('should return 404 for a non-existent sponsor ID', async () => {
    const response = await request(server).get(
      '/sponsors/00000000-0000-0000-0000-000000000000'
    );
    expect(response.status).toBe(404);
  });
});
