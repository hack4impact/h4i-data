import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestMentor = async () => {
  const constituentRes = await request(app)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'Mentor',
      primary_email: `mentor.${Date.now()}.${Math.random()}@example.com`,
    });
  const id = constituentRes.body.constituent_id;
  await request(app)
    .post('/volunteers')
    .send({ volunteer_id: id, volunteer_class: 'ALUMNI' });
  await request(app).post('/mentors').send({ mentor_id: id });
  return id;
};

describe('REST API - /mentorships', () => {
  describe('POST /mentorships', () => {
    it('should create a new mentorship', async () => {
      const mentorId = await createTestMentor();
      const menteeId = await createTestMentor();

      const response = await request(app).post('/mentorships').send({
        mentor_id: mentorId,
        mentee_id: menteeId,
        program_type: 'Career Development',
        status: 'ACTIVE',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('mentorship_id');
      expect(response.body.mentor_id).toBe(mentorId);
      expect(response.body.mentee_id).toBe(menteeId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/mentorships')
        .send({ program_type: 'Career' }); // missing required mentor_id and mentee_id

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /mentorships', () => {
    it('should fetch all mentorships', async () => {
      const mentorId = await createTestMentor();
      const menteeId = await createTestMentor();
      await request(app).post('/mentorships').send({
        mentor_id: mentorId,
        mentee_id: menteeId,
      });

      const response = await request(app).get('/mentorships');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /mentorships/:id', () => {
    it('should fetch a mentorship by ID', async () => {
      const mentorId = await createTestMentor();
      const menteeId = await createTestMentor();
      const created = await request(app).post('/mentorships').send({
        mentor_id: mentorId,
        mentee_id: menteeId,
      });
      const id = created.body.mentorship_id;

      const response = await request(app).get(`/mentorships/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.mentorship_id).toBe(id);
    });

    it('should return 404 for a non-existent mentorship', async () => {
      const response = await request(app).get(
        '/mentorships/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /mentorships/:id', () => {
    it('should update a mentorship', async () => {
      const mentorId = await createTestMentor();
      const menteeId = await createTestMentor();
      const created = await request(app).post('/mentorships').send({
        mentor_id: mentorId,
        mentee_id: menteeId,
      });
      const id = created.body.mentorship_id;

      const response = await request(app)
        .patch(`/mentorships/${id}`)
        .send({ status: 'COMPLETED', notes: 'Completed successfully' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
    });
  });

  describe('DELETE /mentorships/:id', () => {
    it('should delete a mentorship', async () => {
      const mentorId = await createTestMentor();
      const menteeId = await createTestMentor();
      const created = await request(app).post('/mentorships').send({
        mentor_id: mentorId,
        mentee_id: menteeId,
      });
      const id = created.body.mentorship_id;

      const response = await request(app).delete(`/mentorships/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/mentorships/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
