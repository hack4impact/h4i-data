import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

describe('REST API - /universities', () => {
  describe('POST /universities', () => {
    it('should create a new university', async () => {
      const response = await request(app)
        .post('/universities')
        .send({ name: 'Test University', email_domain: 'test.edu' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('university_id');
      expect(response.body.name).toBe('Test University');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/universities')
        .send({ name: 'X' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /universities', () => {
    it('should fetch all universities', async () => {
      await request(app)
        .post('/universities')
        .send({ name: `University ${Date.now()}.${Math.random()}` });

      const response = await request(app).get('/universities');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /universities/:id', () => {
    it('should fetch a university by ID', async () => {
      const created = await request(app)
        .post('/universities')
        .send({ name: `University ${Date.now()}.${Math.random()}` });
      const id = created.body.university_id;

      const response = await request(app).get(`/universities/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.university_id).toBe(id);
    });

    it('should return 404 for a non-existent university', async () => {
      const response = await request(app).get(
        '/universities/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /universities/:id', () => {
    it('should update a university', async () => {
      const created = await request(app)
        .post('/universities')
        .send({ name: `University ${Date.now()}.${Math.random()}` });
      const id = created.body.university_id;

      const response = await request(app)
        .patch(`/universities/${id}`)
        .send({ name: 'Updated University' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated University');
    });

    it('should return 404 for a non-existent university', async () => {
      const response = await request(app)
        .patch('/universities/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated University' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const created = await request(app)
        .post('/universities')
        .send({ name: `University ${Date.now()}.${Math.random()}` });
      const id = created.body.university_id;

      const response = await request(app)
        .patch(`/universities/${id}`)
        .send({ name: 'X' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /universities/:id', () => {
    it('should delete a university', async () => {
      const created = await request(app)
        .post('/universities')
        .send({ name: `University ${Date.now()}.${Math.random()}` });
      const id = created.body.university_id;

      const response = await request(app).delete(`/universities/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/universities/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent university', async () => {
      const response = await request(app).delete(
        '/universities/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
