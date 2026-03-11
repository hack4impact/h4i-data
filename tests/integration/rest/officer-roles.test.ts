import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

describe('REST API - /officer-roles', () => {
  describe('POST /officer-roles', () => {
    it('should create a new officer role', async () => {
      const response = await request(app)
        .post('/officer-roles')
        .send({ name: 'Chapter President', scope: 'CHAPTER', rank_level: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('officer_role_id');
      expect(response.body.name).toBe('Chapter President');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/officer-roles')
        .send({ name: 'X' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /officer-roles', () => {
    it('should fetch all officer roles', async () => {
      await request(app)
        .post('/officer-roles')
        .send({ name: `Role ${Date.now()}.${Math.random()}` });

      const response = await request(app).get('/officer-roles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /officer-roles/:id', () => {
    it('should fetch an officer role by ID', async () => {
      const created = await request(app)
        .post('/officer-roles')
        .send({ name: `Role ${Date.now()}.${Math.random()}` });
      const id = created.body.officer_role_id;

      const response = await request(app).get(`/officer-roles/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.officer_role_id).toBe(id);
    });

    it('should return 404 for a non-existent officer role', async () => {
      const response = await request(app).get(
        '/officer-roles/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /officer-roles/:id', () => {
    it('should update an officer role', async () => {
      const created = await request(app)
        .post('/officer-roles')
        .send({ name: `Role ${Date.now()}.${Math.random()}` });
      const id = created.body.officer_role_id;

      const response = await request(app)
        .patch(`/officer-roles/${id}`)
        .send({ name: 'Updated Role', rank_level: 2 });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Role');
    });

    it('should return 404 for a non-existent officer role', async () => {
      const response = await request(app)
        .patch('/officer-roles/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated Role' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const created = await request(app)
        .post('/officer-roles')
        .send({ name: `Role ${Date.now()}.${Math.random()}` });
      const id = created.body.officer_role_id;

      const response = await request(app)
        .patch(`/officer-roles/${id}`)
        .send({ name: 'X' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /officer-roles/:id', () => {
    it('should delete an officer role', async () => {
      const created = await request(app)
        .post('/officer-roles')
        .send({ name: `Role ${Date.now()}.${Math.random()}` });
      const id = created.body.officer_role_id;

      const response = await request(app).delete(`/officer-roles/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/officer-roles/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent officer role', async () => {
      const response = await request(app).delete(
        '/officer-roles/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
