import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';

let server: Server;
let app: express.Application;
let createdVolunteerId: string;
let constituentId: string;

beforeAll(async () => {
  app = createRestApp();
  server = app.listen(env.REST_PORT);

  // Create a constituent first (required for volunteer)
  const uniqueEmail = `test.volunteer.rest.${Date.now()}@example.com`;
  const constituentData = {
    first_name: 'John',
    last_name: 'Doe',
    primary_email: uniqueEmail,
  };

  const constituentResponse = await request(server)
    .post('/constituents')
    .send(constituentData);

  constituentId = constituentResponse.body.constituent_id;
});

afterAll(async () => {
  server.close();
});

describe('REST API - /volunteers', () => {
  describe('POST /volunteers', () => {
    it('should create a new volunteer', async () => {
      const volunteerData = {
        volunteer_id: constituentId,
        org_email: 'john@org.edu',
        active_status: true,
        volunteer_class: 'COLLEGIATE',
        engagement_track: 'PROGRAMS',
        major: 'Computer Science',
        education_level: 'UNDERGRADUATE',
      };

      const response = await request(server)
        .post('/volunteers')
        .send(volunteerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('volunteer_id');
      expect(response.body.volunteer_id).toBe(constituentId);
      expect(response.body.org_email).toBe('john@org.edu');
      expect(response.body.volunteer_class).toBe('COLLEGIATE');

      createdVolunteerId = response.body.volunteer_id;
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        // Missing volunteer_id which is required
        org_email: 'invalid-email', // Invalid format
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
      expect(response.body.org_email).toBe('john@org.edu');
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
        active_status: false,
        major: 'Software Engineering',
      };

      const response = await request(server)
        .patch(`/volunteers/${createdVolunteerId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.active_status).toBe(false);
      expect(response.body.major).toBe('Software Engineering');
      expect(response.body.org_email).toBe('john@org.edu'); // Unchanged
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
