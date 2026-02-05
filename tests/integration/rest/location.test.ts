import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { disconnectDB, prisma } from '../../../src/config/database';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let createdLocationId: string;

beforeAll(() => {
  app = createRestApp();
  server = app.listen(env.REST_PORT);
});

afterAll(async () => {
  if (createdLocationId) {
    await prisma.locations.delete({
      where: { location_id: createdLocationId },
    });
  }
  server.close();
  await disconnectDB();
});

describe('REST API - /locations', () => {
  describe('POST /locations', () => {
    it('should create a new location', async () => {
      const locationData = {
        name: 'Headquarters',
        address_line: '123 Main Street',
        state_code: 'CA',
        country_code: 'USA',
      };

      const response = await request(server)
        .post('/locations')
        .send(locationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('location_id');
      expect(response.body.name).toBe('Headquarters');
      expect(response.body.address_line).toBe('123 Main Street');
      expect(response.body.state_code).toBe('CA');
      expect(response.body.country_code).toBe('USA');

      createdLocationId = response.body.location_id;
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'A', // Too short
        address_line: 'No',
        state_code: 'ABC', // Invalid format (should be 2 chars)
      };

      const response = await request(server)
        .post('/locations')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /locations', () => {
    it('should fetch all locations', async () => {
      const response = await request(server).get('/locations');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /locations/:id', () => {
    it('should fetch a location by ID', async () => {
      expect(createdLocationId).toBeDefined();

      const response = await request(server).get(
        `/locations/${createdLocationId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.location_id).toBe(createdLocationId);
      expect(response.body.name).toBe('Headquarters');
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(server).get(`/locations/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PATCH /locations/:id', () => {
    it('should update a location', async () => {
      expect(createdLocationId).toBeDefined();

      const updateData = {
        name: 'New York Office',
        state_code: 'NY',
      };

      const response = await request(server)
        .patch(`/locations/${createdLocationId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New York Office');
      expect(response.body.state_code).toBe('NY');
      expect(response.body.address_line).toBe('123 Main Street'); // Unchanged
    });
  });

  describe('DELETE /locations/:id', () => {
    it('should delete a location', async () => {
      expect(createdLocationId).toBeDefined();

      const response = await request(server).delete(
        `/locations/${createdLocationId}`
      );

      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(server).get(
        `/locations/${createdLocationId}`
      );

      expect(getResponse.status).toBe(404);

      // Prevent cleanup attempt
      createdLocationId = '';
    });
  });
});
