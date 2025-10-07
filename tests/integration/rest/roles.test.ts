import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import { createRestApp } from '../../../src/api/rest/server';
import { env } from '../../../src/config/server';
import { level_type } from '@prisma/client';

let server: Server;
let app: express.Application;
let createdRoleId: string;

beforeAll(() => {
  app = createRestApp();
  server = app.listen(env.REST_PORT);
});

afterAll(async () => {
  server.close();
});

describe('REST API - /roles', () => {
  const baseUrl = '/roles';

  describe('POST /roles', () => {
    it('should create a new role', async () => {
      const roleData = {
        name: 'Admin',
        description: 'Administrator role with full permissions',
        permissions: { manage_users: true }, // must have at least one string->boolean
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      };

      const response = await request(server).post(baseUrl).send(roleData);

      console.log(response.status, response.body); // debug if needed

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('role_id');
      expect(response.body.name).toBe(roleData.name);
      expect(response.body.description).toBe(roleData.description);

      createdRoleId = response.body.role_id;
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { name: '' }; // invalid per schema

      const response = await request(server).post(baseUrl).send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /roles', () => {
    it('should fetch all roles', async () => {
      const response = await request(server).get(baseUrl);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /roles/:id', () => {
    it('should fetch a role by ID', async () => {
      expect(createdRoleId).toBeDefined();

      const response = await request(server).get(`${baseUrl}/${createdRoleId}`);

      expect(response.status).toBe(200);
      expect(response.body.role_id).toBe(createdRoleId);
      expect(response.body.name).toBe('Admin');
    });

    it('should return 404 for non-existent role', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(server).get(`${baseUrl}/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PATCH /roles/:id', () => {
    it('should update a role', async () => {
      expect(createdRoleId).toBeDefined();

      const updateData = {
        name: 'Super Admin',
        description: 'Updated description for admin role',
        permissions: { manage_users: true, manage_events: true }, // include permissions per schema
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      };

      const response = await request(server)
        .patch(`${baseUrl}/${createdRoleId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.permissions).toEqual(updateData.permissions);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should delete a role', async () => {
      expect(createdRoleId).toBeDefined();

      const response = await request(server).delete(
        `${baseUrl}/${createdRoleId}`
      );

      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(server).get(
        `${baseUrl}/${createdRoleId}`
      );
      expect(getResponse.status).toBe(404);

      createdRoleId = ''; // prevent cleanup attempt
    });
  });
});
