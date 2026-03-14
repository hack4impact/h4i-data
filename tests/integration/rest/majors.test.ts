import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

describe('REST API - /majors', () => {
  describe('POST /majors', () => {
    it('should create a new major', async () => {
      const response = await request(app)
        .post('/majors')
        .send({ name: 'Computer Science' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('major_id');
      expect(response.body.name).toBe('Computer Science');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app).post('/majors').send({ name: 'X' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /majors', () => {
    it('should fetch all majors', async () => {
      await request(app)
        .post('/majors')
        .send({ name: `Major ${Date.now()}.${Math.random()}` });

      const response = await request(app).get('/majors');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /majors/:id', () => {
    it('should fetch a major by ID', async () => {
      const created = await request(app)
        .post('/majors')
        .send({ name: `Major ${Date.now()}.${Math.random()}` });
      const id = created.body.major_id;

      const response = await request(app).get(`/majors/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.major_id).toBe(id);
    });

    it('should return 404 for a non-existent major', async () => {
      const response = await request(app).get(
        '/majors/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /majors/:id', () => {
    it('should update a major', async () => {
      const created = await request(app)
        .post('/majors')
        .send({ name: `Major ${Date.now()}.${Math.random()}` });
      const id = created.body.major_id;

      const response = await request(app)
        .patch(`/majors/${id}`)
        .send({ name: 'Updated Major' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Major');
    });

    it('should return 404 for a non-existent major', async () => {
      const response = await request(app)
        .patch('/majors/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated Major' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const created = await request(app)
        .post('/majors')
        .send({ name: `Major ${Date.now()}.${Math.random()}` });
      const id = created.body.major_id;

      const response = await request(app)
        .patch(`/majors/${id}`)
        .send({ name: 'X' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /majors/:id', () => {
    it('should delete a major', async () => {
      const created = await request(app)
        .post('/majors')
        .send({ name: `Major ${Date.now()}.${Math.random()}` });
      const id = created.body.major_id;

      const response = await request(app).delete(`/majors/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/majors/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent major', async () => {
      const response = await request(app).delete(
        '/majors/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
