import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

describe('REST API - /chapters', () => {
  it('should create a new chapter via POST', async () => {
    // Act
    const response = await request(app).post('/chapters').send({
      name: 'REST Integration Test Chapter',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('chapter_id');
    expect(response.body.name).toBe('REST Integration Test Chapter');
  });

  it('should fetch all chapters via GET', async () => {
    // Arrange - create a chapter first
    await request(app).post('/chapters').send({
      name: 'Test Chapter for List',
      founded_date: '2025-08-30T12:00:00.000Z',
    });

    // Act
    const response = await request(app).get('/chapters');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should fetch a chapter by ID via GET', async () => {
    // Arrange
    const createResponse = await request(app).post('/chapters').send({
      name: 'Test Chapter for Fetch',
      founded_date: '2025-08-30T12:00:00.000Z',
    });
    const chapterId = createResponse.body.chapter_id;

    // Act
    const response = await request(app).get(`/chapters/${chapterId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.chapter_id).toBe(chapterId);
    expect(response.body.name).toBe('Test Chapter for Fetch');
  });

  it('should return 404 for a non-existent chapter ID', async () => {
    // Act
    const response = await request(app).get(
      '/chapters/00000000-0000-0000-0000-000000000000'
    );

    // Assert
    expect(response.status).toBe(404);
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

  it('should update a chapter via PATCH', async () => {
    // Arrange
    const createResponse = await request(app).post('/chapters').send({
      name: 'Test Chapter for Update',
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

  it('should delete a chapter via DELETE', async () => {
    // Arrange
    const createResponse = await request(app).post('/chapters').send({
      name: 'Test Chapter for Delete',
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
});
