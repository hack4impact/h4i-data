import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestProject = async () => {
  const res = await request(app)
    .post('/projects')
    .send({ name: `Project ${Date.now()}` });
  return res.body.project_id;
};

describe('REST API - /project-deliverables', () => {
  describe('POST /project-deliverables', () => {
    it('should create a new project deliverable', async () => {
      const projectId = await createTestProject();

      const response = await request(app).post('/project-deliverables').send({
        project_id: projectId,
        label: 'Source Code',
        url: 'https://github.com/org/repo',
        category: 'REPO',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('deliverable_id');
      expect(response.body.project_id).toBe(projectId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/project-deliverables')
        .send({ label: 'Missing project_id' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /project-deliverables', () => {
    it('should fetch all project deliverables', async () => {
      const projectId = await createTestProject();
      await request(app).post('/project-deliverables').send({
        project_id: projectId,
        url: 'https://github.com/org/repo2',
      });

      const response = await request(app).get('/project-deliverables');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /project-deliverables/:id', () => {
    it('should fetch a project deliverable by ID', async () => {
      const projectId = await createTestProject();
      const created = await request(app).post('/project-deliverables').send({
        project_id: projectId,
        label: 'Design Spec',
      });
      const id = created.body.deliverable_id;

      const response = await request(app).get(`/project-deliverables/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.deliverable_id).toBe(id);
    });

    it('should return 404 for a non-existent deliverable', async () => {
      const response = await request(app).get(
        '/project-deliverables/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /project-deliverables/:id', () => {
    it('should update a project deliverable', async () => {
      const projectId = await createTestProject();
      const created = await request(app).post('/project-deliverables').send({
        project_id: projectId,
        label: 'Original Label',
      });
      const id = created.body.deliverable_id;

      const response = await request(app)
        .patch(`/project-deliverables/${id}`)
        .send({ label: 'Updated Label' });

      expect(response.status).toBe(200);
      expect(response.body.label).toBe('Updated Label');
    });
  });

  describe('DELETE /project-deliverables/:id', () => {
    it('should delete a project deliverable', async () => {
      const projectId = await createTestProject();
      const created = await request(app).post('/project-deliverables').send({
        project_id: projectId,
        label: 'To Delete',
      });
      const id = created.body.deliverable_id;

      const response = await request(app).delete(`/project-deliverables/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/project-deliverables/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
