import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestProject = async () => {
  const res = await request(app)
    .post('/projects')
    .send({ name: `Project ${Date.now()}` });
  return res.body.project_id;
};

describe('REST API - /project-engagements', () => {
  describe('POST /project-engagements', () => {
    it('should create a new project engagement', async () => {
      const projectId = await createTestProject();

      const response = await request(app).post('/project-engagements').send({
        project_id: projectId,
        status: 'ACTIVE',
        domain: 'FULL_STACK',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('engagement_id');
      expect(response.body.project_id).toBe(projectId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/project-engagements')
        .send({ status: 'ACTIVE' }); // missing required project_id

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /project-engagements', () => {
    it('should fetch all project engagements', async () => {
      const projectId = await createTestProject();
      await request(app)
        .post('/project-engagements')
        .send({ project_id: projectId });

      const response = await request(app).get('/project-engagements');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /project-engagements/:id', () => {
    it('should fetch a project engagement by ID', async () => {
      const projectId = await createTestProject();
      const created = await request(app)
        .post('/project-engagements')
        .send({ project_id: projectId });
      const id = created.body.engagement_id;

      const response = await request(app).get(`/project-engagements/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.engagement_id).toBe(id);
    });

    it('should return 404 for a non-existent engagement', async () => {
      const response = await request(app).get(
        '/project-engagements/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /project-engagements/:id', () => {
    it('should update a project engagement', async () => {
      const projectId = await createTestProject();
      const created = await request(app)
        .post('/project-engagements')
        .send({ project_id: projectId, status: 'ACTIVE' });
      const id = created.body.engagement_id;

      const response = await request(app)
        .patch(`/project-engagements/${id}`)
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
    });
  });

  describe('DELETE /project-engagements/:id', () => {
    it('should delete a project engagement', async () => {
      const projectId = await createTestProject();
      const created = await request(app)
        .post('/project-engagements')
        .send({ project_id: projectId });
      const id = created.body.engagement_id;

      const response = await request(app).delete(`/project-engagements/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/project-engagements/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
