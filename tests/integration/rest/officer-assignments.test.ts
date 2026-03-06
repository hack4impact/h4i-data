import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestVolunteer = async () => {
  const constituentRes = await request(app)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'Officer',
      primary_email: `officer.${Date.now()}.${Math.random()}@example.com`,
    });
  const id = constituentRes.body.constituent_id;
  await request(app)
    .post('/volunteers')
    .send({ volunteer_id: id, volunteer_class: 'COLLEGIATE' });
  return id;
};

const createTestOfficerRole = async () => {
  const res = await request(app)
    .post('/officer-roles')
    .send({ name: `Role ${Date.now()}` });
  return res.body.role_id;
};

const createTestChapter = async () => {
  const res = await request(app)
    .post('/chapters')
    .send({ name: `Chapter ${Date.now()}` });
  return res.body.chapter_id;
};

describe('REST API - /officer-assignments', () => {
  describe('POST /officer-assignments', () => {
    it('should create a new officer assignment', async () => {
      const volunteerId = await createTestVolunteer();
      const roleId = await createTestOfficerRole();
      const chapterId = await createTestChapter();

      const response = await request(app).post('/officer-assignments').send({
        volunteer_id: volunteerId,
        role_id: roleId,
        chapter_id: chapterId,
        start_date: '2025-01-01T00:00:00.000Z',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('assignment_id');
      expect(response.body.volunteer_id).toBe(volunteerId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/officer-assignments')
        .send({ start_date: '2025-01-01T00:00:00.000Z' }); // missing required FKs

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /officer-assignments', () => {
    it('should fetch all officer assignments', async () => {
      const volunteerId = await createTestVolunteer();
      const roleId = await createTestOfficerRole();
      const chapterId = await createTestChapter();
      await request(app).post('/officer-assignments').send({
        volunteer_id: volunteerId,
        role_id: roleId,
        chapter_id: chapterId,
      });

      const response = await request(app).get('/officer-assignments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /officer-assignments/:id', () => {
    it('should fetch an officer assignment by ID', async () => {
      const volunteerId = await createTestVolunteer();
      const roleId = await createTestOfficerRole();
      const chapterId = await createTestChapter();
      const created = await request(app).post('/officer-assignments').send({
        volunteer_id: volunteerId,
        role_id: roleId,
        chapter_id: chapterId,
      });
      const id = created.body.assignment_id;

      const response = await request(app).get(`/officer-assignments/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.assignment_id).toBe(id);
    });

    it('should return 404 for a non-existent assignment', async () => {
      const response = await request(app).get(
        '/officer-assignments/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /officer-assignments/:id', () => {
    it('should update an officer assignment', async () => {
      const volunteerId = await createTestVolunteer();
      const roleId = await createTestOfficerRole();
      const chapterId = await createTestChapter();
      const created = await request(app).post('/officer-assignments').send({
        volunteer_id: volunteerId,
        role_id: roleId,
        chapter_id: chapterId,
      });
      const id = created.body.assignment_id;

      const response = await request(app)
        .patch(`/officer-assignments/${id}`)
        .send({ end_date: '2025-12-31T00:00:00.000Z' });

      expect(response.status).toBe(200);
      expect(response.body.assignment_id).toBe(id);
    });
  });

  describe('DELETE /officer-assignments/:id', () => {
    it('should delete an officer assignment', async () => {
      const volunteerId = await createTestVolunteer();
      const roleId = await createTestOfficerRole();
      const chapterId = await createTestChapter();
      const created = await request(app).post('/officer-assignments').send({
        volunteer_id: volunteerId,
        role_id: roleId,
        chapter_id: chapterId,
      });
      const id = created.body.assignment_id;

      const response = await request(app).delete(`/officer-assignments/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/officer-assignments/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
