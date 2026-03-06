import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

describe('REST API - /project-roles', () => {
  describe('POST /project-roles', () => {
    it('should create a new project role', async () => {
      const response = await request(app)
        .post('/project-roles')
        .send({ name: 'Tech Lead', is_leadership: true });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('role_id');
      expect(response.body.name).toBe('Tech Lead');
      expect(response.body.is_leadership).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/project-roles')
        .send({ name: 'X' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /project-roles', () => {
    it('should fetch all project roles', async () => {
      await request(app)
        .post('/project-roles')
        .send({ name: `Role ${Date.now()}` });

      const response = await request(app).get('/project-roles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /project-roles/:id', () => {
    it('should fetch a project role by ID', async () => {
      const created = await request(app)
        .post('/project-roles')
        .send({ name: `Role ${Date.now()}` });
      const id = created.body.role_id;

      const response = await request(app).get(`/project-roles/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.role_id).toBe(id);
    });

    it('should return 404 for a non-existent project role', async () => {
      const response = await request(app).get(
        '/project-roles/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /project-roles/:id', () => {
    it('should update a project role', async () => {
      const created = await request(app)
        .post('/project-roles')
        .send({ name: `Role ${Date.now()}` });
      const id = created.body.role_id;

      const response = await request(app)
        .patch(`/project-roles/${id}`)
        .send({ name: 'Updated Role', is_leadership: false });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Role');
    });
  });

  describe('DELETE /project-roles/:id', () => {
    it('should delete a project role', async () => {
      const created = await request(app)
        .post('/project-roles')
        .send({ name: `Role ${Date.now()}` });
      const id = created.body.role_id;

      const response = await request(app).delete(`/project-roles/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/project-roles/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
