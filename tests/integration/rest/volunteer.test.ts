import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let createdVolunteerId: string;

beforeAll(() => {
  app = createRestApp();
  // Start the server on the port defined in .env.test
  server = app.listen(env.REST_PORT);
});

afterAll(async () => {
  // Close the server
  server.close();
});

describe('REST API - /volunteers', () => {
  describe('POST /volunteers', () => {
    it('should create a new volunteer', async () => {
      const volunteerData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        graduation_date: new Date('2026-06-18').toISOString(),
        volunteer_status: 'STUDENT',
        volunteer_type: 'BOTH',
        university_id: '07608837-420f-4697-bda2-701506079a9d', // Test UUID from Supabase
      };

      const response = await request(server)
        .post('/volunteers')
        .send(volunteerData);

      // This will fail initially - RED phase
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('volunteer_id');
      expect(response.body.first_name).toBe('John');
      expect(response.body.last_name).toBe('Doe');
      expect(response.body.email).toBe('john.doe@example.com');
      expect(response.body.volunteer_status).toBe('STUDENT');

      createdVolunteerId = response.body.volunteer_id;
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        first_name: 'A', // Too short
        email: 'invalid-email', // Invalid format
      };

      const response = await request(server)
        .post('/volunteers')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /volunteers', () => {
    it('should fetch all volunteers', async () => {
      const response = await request(server).get('/volunteers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /volunteers/:id', () => {
    it('should fetch a volunteer by ID', async () => {
      expect(createdVolunteerId).toBeDefined();

      const response = await request(server).get(
        `/volunteers/${createdVolunteerId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.volunteer_id).toBe(createdVolunteerId);
      expect(response.body.first_name).toBe('John');
    });

    it('should return 404 for non-existent volunteer', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(server).get(`/volunteers/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PATCH /volunteers/:id', () => {
    it('should update a volunteer', async () => {
      expect(createdVolunteerId).toBeDefined();

      const updateData = {
        first_name: 'Jane',
        volunteer_status: 'PROFESSIONAL',
      };

      const response = await request(server)
        .patch(`/volunteers/${createdVolunteerId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe('Jane');
      expect(response.body.volunteer_status).toBe('PROFESSIONAL');
      expect(response.body.last_name).toBe('Doe'); // Unchanged
    });
  });

  describe('DELETE /volunteers/:id', () => {
    it('should delete a volunteer', async () => {
      expect(createdVolunteerId).toBeDefined();

      const response = await request(server).delete(
        `/volunteers/${createdVolunteerId}`
      );

      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(server).get(
        `/volunteers/${createdVolunteerId}`
      );

      expect(getResponse.status).toBe(404);

      // Prevent cleanup attempt
      createdVolunteerId = '';
    });
  });
});
