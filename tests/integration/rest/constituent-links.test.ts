import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestConstituent = async () => {
  const res = await request(app)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'User',
      primary_email: `social.${Date.now()}.${Math.random()}@example.com`,
    });
  return res.body.constituent_id;
};

describe('REST API - /constituent-links', () => {
  describe('POST /constituent-links', () => {
    it('should create a new constituent link', async () => {
      // Arrange
      const constituentId = await createTestConstituent();

      // Act
      const response = await request(app).post('/constituent-links').send({
        constituent_id: constituentId,
        platform: 'GITHUB',
        url: 'https://github.com/testuser',
      });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('constituent_link_id');
      expect(response.body.constituent_id).toBe(constituentId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app).post('/constituent-links').send({
        url: 'not-a-url',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /constituent-links', () => {
    it('should fetch all constituent links', async () => {
      // Arrange
      const constituentId = await createTestConstituent();
      await request(app).post('/constituent-links').send({
        constituent_id: constituentId,
        url: 'https://github.com/testuser2',
      });

      // Act
      const response = await request(app).get('/constituent-links');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /constituent-links/:id', () => {
    it('should fetch a constituent link by ID', async () => {
      const constituentId = await createTestConstituent();
      const created = await request(app).post('/constituent-links').send({
        constituent_id: constituentId,
        url: 'https://linkedin.com/in/testuser',
      });
      const id = created.body.constituent_link_id;

      const response = await request(app).get(`/constituent-links/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.constituent_link_id).toBe(id);
    });

    it('should return 404 for a non-existent constituent link', async () => {
      const response = await request(app).get(
        '/constituent-links/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /constituent-links/:id', () => {
    it('should update a constituent link', async () => {
      const constituentId = await createTestConstituent();
      const created = await request(app).post('/constituent-links').send({
        constituent_id: constituentId,
        url: 'https://github.com/original',
      });
      const id = created.body.constituent_link_id;

      const response = await request(app)
        .patch(`/constituent-links/${id}`)
        .send({ url: 'https://github.com/updated' });

      expect(response.status).toBe(200);
      expect(response.body.url).toBe('https://github.com/updated');
    });

    it('should return 404 for a non-existent constituent link', async () => {
      const response = await request(app)
        .patch('/constituent-links/00000000-0000-0000-0000-000000000000')
        .send({ url: 'https://github.com/updated' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const constituentId = await createTestConstituent();
      const created = await request(app).post('/constituent-links').send({
        constituent_id: constituentId,
        url: 'https://github.com/original',
      });
      const id = created.body.constituent_link_id;

      const response = await request(app)
        .patch(`/constituent-links/${id}`)
        .send({ url: 'not-a-url' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /constituent-links/:id', () => {
    it('should delete a constituent link', async () => {
      const constituentId = await createTestConstituent();
      const created = await request(app).post('/constituent-links').send({
        constituent_id: constituentId,
        url: 'https://github.com/todelete',
      });
      const id = created.body.constituent_link_id;

      const response = await request(app).delete(`/constituent-links/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/constituent-links/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent constituent link', async () => {
      const response = await request(app).delete(
        '/constituent-links/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
