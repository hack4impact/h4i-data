import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

const createTestProject = async () => {
  const res = await request(app)
    .post('/projects')
    .send({ name: `Project ${Date.now()}.${Math.random()}` });
  return res.body.project_id;
};

describe('REST API - /project-resources', () => {
  describe('POST /project-resources', () => {
    it('should create a new project resource', async () => {
      const projectId = await createTestProject();

      const response = await request(app).post('/project-resources').send({
        project_id: projectId,
        label: 'Source Code',
        url: 'https://github.com/org/repo',
        category: 'CODE',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('project_resource_id');
      expect(response.body.project_id).toBe(projectId);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/project-resources')
        .send({ label: 'Missing project_id' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /project-resources', () => {
    it('should fetch all project resources', async () => {
      const projectId = await createTestProject();
      await request(app).post('/project-resources').send({
        project_id: projectId,
        url: 'https://github.com/org/repo2',
      });

      const response = await request(app).get('/project-resources');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /project-resources/:id', () => {
    it('should fetch a project resource by ID', async () => {
      const projectId = await createTestProject();
      const created = await request(app).post('/project-resources').send({
        project_id: projectId,
        label: 'Design Spec',
      });
      const id = created.body.project_resource_id;

      const response = await request(app).get(`/project-resources/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.project_resource_id).toBe(id);
    });

    it('should return 404 for a non-existent resource', async () => {
      const response = await request(app).get(
        '/project-resources/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /project-resources/:id', () => {
    it('should update a project resource', async () => {
      const projectId = await createTestProject();
      const created = await request(app).post('/project-resources').send({
        project_id: projectId,
        label: 'Original Label',
      });
      const id = created.body.project_resource_id;

      const response = await request(app)
        .patch(`/project-resources/${id}`)
        .send({ label: 'Updated Label' });

      expect(response.status).toBe(200);
      expect(response.body.label).toBe('Updated Label');
    });

    it('should return 404 for a non-existent resource', async () => {
      const response = await request(app)
        .patch('/project-resources/00000000-0000-0000-0000-000000000000')
        .send({ label: 'Updated Label' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const projectId = await createTestProject();
      const created = await request(app).post('/project-resources').send({
        project_id: projectId,
        label: 'Original Label',
      });
      const id = created.body.project_resource_id;

      const response = await request(app)
        .patch(`/project-resources/${id}`)
        .send({ url: 'not-a-url' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /project-resources/:id', () => {
    it('should delete a project resource', async () => {
      const projectId = await createTestProject();
      const created = await request(app).post('/project-resources').send({
        project_id: projectId,
        label: 'To Delete',
      });
      const id = created.body.project_resource_id;

      const response = await request(app).delete(`/project-resources/${id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/project-resources/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent resource', async () => {
      const response = await request(app).delete(
        '/project-resources/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
