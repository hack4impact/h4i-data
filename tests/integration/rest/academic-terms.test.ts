import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

describe('REST API - /academic-terms', () => {
  describe('POST /academic-terms', () => {
    it('should create a new academic term', async () => {
      const response = await request(app)
        .post('/academic-terms')
        .send({ name: 'Fall 2025', type: 'SEMESTER' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('academic_term_id');
      expect(response.body.name).toBe('Fall 2025');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/academic-terms')
        .send({ type: 'SEMESTER' }); // missing required name

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /academic-terms', () => {
    it('should fetch all academic terms', async () => {
      await request(app)
        .post('/academic-terms')
        .send({ name: `Term ${Date.now()}.${Math.random()}` });

      const response = await request(app).get('/academic-terms');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /academic-terms/:id', () => {
    it('should fetch an academic term by ID', async () => {
      const created = await request(app)
        .post('/academic-terms')
        .send({ name: `Term ${Date.now()}.${Math.random()}` });
      const id = created.body.academic_term_id;

      const response = await request(app).get(`/academic-terms/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.academic_term_id).toBe(id);
    });

    it('should return 404 for a non-existent academic term', async () => {
      const response = await request(app).get(
        '/academic-terms/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /academic-terms/:id', () => {
    it('should update an academic term', async () => {
      const created = await request(app)
        .post('/academic-terms')
        .send({ name: `Term ${Date.now()}.${Math.random()}` });
      const id = created.body.academic_term_id;

      const response = await request(app)
        .patch(`/academic-terms/${id}`)
        .send({ name: 'Spring 2026' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Spring 2026');
    });

    it('should return 404 for a non-existent academic term', async () => {
      const response = await request(app)
        .patch('/academic-terms/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Spring 2026' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid academic term', async () => {
      const created = await request(app)
        .post('/academic-terms')
        .send({ name: `Term ${Date.now()}.${Math.random()}` });
      const id = created.body.academic_term_id;

      const response = await request(app)
        .patch(`/academic-terms/${id}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /academic-terms/:id', () => {
    it('should delete an academic term', async () => {
      const created = await request(app)
        .post('/academic-terms')
        .send({ name: `Term ${Date.now()}.${Math.random()}` });
      const id = created.body.academic_term_id;

      const response = await request(app).delete(`/academic-terms/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/academic-terms/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent academic term', async () => {
      const response = await request(app).delete(
        '/academic-terms/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });
});
