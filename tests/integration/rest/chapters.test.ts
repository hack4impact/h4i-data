import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

describe('REST API - /chapters', () => {
  describe('POST /chapters', () => {
    it('should create a new chapter', async () => {
      // Act
      const response = await request(app)
        .post('/chapters')
        .send({
          name: `Test Chapter ${Date.now()}.${Math.random()}`,
          founded_date: '2025-08-30T12:00:00.000Z',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('chapter_id');
    });

    it('should return 400 for invalid data', async () => {
      // Act - missing required 'name' field
      const response = await request(app).post('/chapters').send({
        founded_date: '2025-08-30T12:00:00.000Z',
      });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /chapters', () => {
    it('should fetch all chapters', async () => {
      // Arrange
      await request(app)
        .post('/chapters')
        .send({
          name: `Test Chapter ${Date.now()}.${Math.random()}`,
          founded_date: '2025-08-30T12:00:00.000Z',
        });

      // Act
      const response = await request(app).get('/chapters');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /chapters/:id', () => {
    it('should fetch a chapter by ID', async () => {
      // Arrange
      const createResponse = await request(app)
        .post('/chapters')
        .send({
          name: `Test Chapter ${Date.now()}.${Math.random()}`,
          founded_date: '2025-08-30T12:00:00.000Z',
        });
      const chapterId = createResponse.body.chapter_id;

      // Act
      const response = await request(app).get(`/chapters/${chapterId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.chapter_id).toBe(chapterId);
    });

    it('should return 404 for a non-existent chapter ID', async () => {
      // Act
      const response = await request(app).get(
        '/chapters/00000000-0000-0000-0000-000000000000'
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /chapters/:id', () => {
    it('should update a chapter', async () => {
      // Arrange
      const createResponse = await request(app)
        .post('/chapters')
        .send({
          name: `Test Chapter ${Date.now()}.${Math.random()}`,
          founded_date: '2025-08-30T12:00:00.000Z',
        });
      const chapterId = createResponse.body.chapter_id;

      // Act
      const response = await request(app)
        .patch(`/chapters/${chapterId}`)
        .send({ name: 'Updated Chapter Name' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Chapter Name');
    });

    it('should return 404 for a non-existent chapter', async () => {
      const response = await request(app)
        .patch('/chapters/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated Chapter Name' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const createResponse = await request(app)
        .post('/chapters')
        .send({
          name: `Test Chapter ${Date.now()}.${Math.random()}`,
          founded_date: '2025-08-30T12:00:00.000Z',
        });
      const chapterId = createResponse.body.chapter_id;

      const response = await request(app)
        .patch(`/chapters/${chapterId}`)
        .send({ name: '' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /chapters/:id', () => {
    it('should delete a chapter', async () => {
      // Arrange
      const createResponse = await request(app)
        .post('/chapters')
        .send({
          name: `Test Chapter ${Date.now()}.${Math.random()}`,
          founded_date: '2025-08-30T12:00:00.000Z',
        });
      const chapterId = createResponse.body.chapter_id;

      // Act
      const response = await request(app).delete(`/chapters/${chapterId}`);

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(`/chapters/${chapterId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent chapter', async () => {
      const response = await request(app).delete(
        '/chapters/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
