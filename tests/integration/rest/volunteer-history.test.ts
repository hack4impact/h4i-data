import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestVolunteer = async () => {
  const constituentRes = await request(app)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'Volunteer',
      primary_email: `vh.${Date.now()}.${Math.random()}@example.com`,
    });
  const constituentId = constituentRes.body.constituent_id;

  await request(app)
    .post('/volunteers')
    .send({ volunteer_id: constituentId, volunteer_class: 'COLLEGIATE' });

  return constituentId;
};

describe('REST API - /volunteer-history', () => {
  describe('POST /volunteer-history', () => {
    it('should create a new volunteer history record', async () => {
      const volunteerId = await createTestVolunteer();

      const response = await request(app).post('/volunteer-history').send({
        volunteer_id: volunteerId,
        action_type: 'ENROLLED',
        effective_date: '2025-01-01T00:00:00.000Z',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('history_id');
      expect(response.body.volunteer_id).toBe(volunteerId);
      expect(response.body.action_type).toBe('ENROLLED');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/volunteer-history')
        .send({ action_type: 'ENROLLED' }); // missing volunteer_id and effective_date

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /volunteer-history', () => {
    it('should fetch all volunteer history records', async () => {
      const volunteerId = await createTestVolunteer();
      await request(app).post('/volunteer-history').send({
        volunteer_id: volunteerId,
        action_type: 'ENROLLED',
        effective_date: '2025-01-01T00:00:00.000Z',
      });

      const response = await request(app).get('/volunteer-history');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /volunteer-history/:id', () => {
    it('should fetch a volunteer history record by ID', async () => {
      const volunteerId = await createTestVolunteer();
      const created = await request(app).post('/volunteer-history').send({
        volunteer_id: volunteerId,
        action_type: 'ENROLLED',
        effective_date: '2025-01-01T00:00:00.000Z',
      });
      const id = created.body.history_id;

      const response = await request(app).get(`/volunteer-history/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.history_id).toBe(id);
    });

    it('should return 404 for a non-existent record', async () => {
      const response = await request(app).get(
        '/volunteer-history/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /volunteer-history/:id', () => {
    it('should update a volunteer history record', async () => {
      const volunteerId = await createTestVolunteer();
      const created = await request(app).post('/volunteer-history').send({
        volunteer_id: volunteerId,
        action_type: 'ENROLLED',
        effective_date: '2025-01-01T00:00:00.000Z',
      });
      const id = created.body.history_id;

      const response = await request(app)
        .patch(`/volunteer-history/${id}`)
        .send({ new_value_label: 'Updated label' });

      expect(response.status).toBe(200);
      expect(response.body.new_value_label).toBe('Updated label');
    });

    it('should return 404 for a non-existent volunteer history record', async () => {
      const response = await request(app)
        .patch('/volunteer-history/00000000-0000-0000-0000-000000000000')
        .send({ new_value_label: 'Updated' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const volunteerId = await createTestVolunteer();
      const created = await request(app).post('/volunteer-history').send({
        volunteer_id: volunteerId,
        action_type: 'ENROLLED',
        effective_date: '2025-01-01T00:00:00.000Z',
      });
      const id = created.body.history_id;

      const response = await request(app)
        .patch(`/volunteer-history/${id}`)
        .send({ action_type: 'INVALID' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /volunteer-history/:id', () => {
    it('should delete a volunteer history record', async () => {
      const volunteerId = await createTestVolunteer();
      const created = await request(app).post('/volunteer-history').send({
        volunteer_id: volunteerId,
        action_type: 'ENROLLED',
        effective_date: '2025-01-01T00:00:00.000Z',
      });
      const id = created.body.history_id;

      const response = await request(app).delete(`/volunteer-history/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/volunteer-history/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent volunteer history record', async () => {
      const response = await request(app).delete(
        '/volunteer-history/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
