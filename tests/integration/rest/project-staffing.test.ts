import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestVolunteer = async () => {
  const constituentRes = await request(app)
    .post('/constituents')
    .send({
      first_name: 'Test',
      last_name: 'Staff',
      primary_email: `staffing.${Date.now()}.${Math.random()}@example.com`,
    });
  const id = constituentRes.body.constituent_id;
  await request(app)
    .post('/volunteers')
    .send({ volunteer_id: id, volunteer_class: 'COLLEGIATE' });
  return id;
};

const createTestEngagement = async () => {
  const projectRes = await request(app)
    .post('/projects')
    .send({ name: `Project ${Date.now()}` });
  const projectId = projectRes.body.project_id;

  const engagementRes = await request(app)
    .post('/project-engagements')
    .send({ project_id: projectId, status: 'ACTIVE' });
  return engagementRes.body.engagement_id;
};

describe('REST API - /project-staffing', () => {
  describe('POST /project-staffing', () => {
    it('should create a new project staffing record', async () => {
      const volunteerId = await createTestVolunteer();
      const engagementId = await createTestEngagement();

      const response = await request(app).post('/project-staffing').send({
        volunteer_id: volunteerId,
        engagement_id: engagementId,
        is_lead_contact: true,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('staffing_id');
      expect(response.body.volunteer_id).toBe(volunteerId);
      expect(response.body.engagement_id).toBe(engagementId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/project-staffing')
        .send({ is_lead_contact: true }); // missing required volunteer_id and engagement_id

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /project-staffing', () => {
    it('should fetch all project staffing records', async () => {
      const volunteerId = await createTestVolunteer();
      const engagementId = await createTestEngagement();
      await request(app).post('/project-staffing').send({
        volunteer_id: volunteerId,
        engagement_id: engagementId,
      });

      const response = await request(app).get('/project-staffing');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /project-staffing/:id', () => {
    it('should fetch a project staffing record by ID', async () => {
      const volunteerId = await createTestVolunteer();
      const engagementId = await createTestEngagement();
      const created = await request(app).post('/project-staffing').send({
        volunteer_id: volunteerId,
        engagement_id: engagementId,
      });
      const id = created.body.staffing_id;

      const response = await request(app).get(`/project-staffing/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.staffing_id).toBe(id);
    });

    it('should return 404 for a non-existent staffing record', async () => {
      const response = await request(app).get(
        '/project-staffing/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /project-staffing/:id', () => {
    it('should update a project staffing record', async () => {
      const volunteerId = await createTestVolunteer();
      const engagementId = await createTestEngagement();
      const created = await request(app).post('/project-staffing').send({
        volunteer_id: volunteerId,
        engagement_id: engagementId,
        is_lead_contact: false,
      });
      const id = created.body.staffing_id;

      const response = await request(app)
        .patch(`/project-staffing/${id}`)
        .send({ is_lead_contact: true });

      expect(response.status).toBe(200);
      expect(response.body.is_lead_contact).toBe(true);
    });
  });

  describe('DELETE /project-staffing/:id', () => {
    it('should delete a project staffing record', async () => {
      const volunteerId = await createTestVolunteer();
      const engagementId = await createTestEngagement();
      const created = await request(app).post('/project-staffing').send({
        volunteer_id: volunteerId,
        engagement_id: engagementId,
      });
      const id = created.body.staffing_id;

      const response = await request(app).delete(`/project-staffing/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/project-staffing/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
