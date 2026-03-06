import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestConstituent = async () => {
  const res = await request(app)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'User',
      primary_email: `social.${Date.now()}@example.com`,
    });
  return res.body.constituent_id;
};

describe('REST API - /social-links', () => {
  describe('POST /social-links', () => {
    it('should create a new social link', async () => {
      const constituentId = await createTestConstituent();

      const response = await request(app).post('/social-links').send({
        constituent_id: constituentId,
        platform: 'GITHUB',
        url: 'https://github.com/testuser',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('link_id');
      expect(response.body.constituent_id).toBe(constituentId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app).post('/social-links').send({
        url: 'not-a-url',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /social-links', () => {
    it('should fetch all social links', async () => {
      const constituentId = await createTestConstituent();
      await request(app).post('/social-links').send({
        constituent_id: constituentId,
        url: 'https://github.com/testuser2',
      });

      const response = await request(app).get('/social-links');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /social-links/:id', () => {
    it('should fetch a social link by ID', async () => {
      const constituentId = await createTestConstituent();
      const created = await request(app).post('/social-links').send({
        constituent_id: constituentId,
        url: 'https://linkedin.com/in/testuser',
      });
      const id = created.body.link_id;

      const response = await request(app).get(`/social-links/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.link_id).toBe(id);
    });

    it('should return 404 for a non-existent social link', async () => {
      const response = await request(app).get(
        '/social-links/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /social-links/:id', () => {
    it('should update a social link', async () => {
      const constituentId = await createTestConstituent();
      const created = await request(app).post('/social-links').send({
        constituent_id: constituentId,
        url: 'https://github.com/original',
      });
      const id = created.body.link_id;

      const response = await request(app)
        .patch(`/social-links/${id}`)
        .send({ url: 'https://github.com/updated', is_featured: true });

      expect(response.status).toBe(200);
      expect(response.body.url).toBe('https://github.com/updated');
    });
  });

  describe('DELETE /social-links/:id', () => {
    it('should delete a social link', async () => {
      const constituentId = await createTestConstituent();
      const created = await request(app).post('/social-links').send({
        constituent_id: constituentId,
        url: 'https://github.com/todelete',
      });
      const id = created.body.link_id;

      const response = await request(app).delete(`/social-links/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/social-links/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
