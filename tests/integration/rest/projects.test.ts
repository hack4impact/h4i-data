import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a project for tests
const createTestProject = async () => {
  const response = await request(app)
    .post('/projects')
    .send({
      name: `Test Project ${Date.now()}.${Math.random()}`,
      github_url: 'https://github.com/test/project',
    });
  return response.body;
};

describe('REST API - /projects', () => {
  describe('POST /projects', () => {
    it('should create a new project', async () => {
      // Act
      const response = await request(app)
        .post('/projects')
        .send({
          name: `Test Project ${Date.now()}.${Math.random()}`,
          github_url: 'https://github.com/test/project',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('project_id');
    });

    it('should return 400 for invalid data', async () => {
      // Act - missing required 'name' field
      const response = await request(app).post('/projects').send({
        github_url: 'https://github.com/test/project',
      });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /projects', () => {
    it('should fetch all projects', async () => {
      // Arrange
      await createTestProject();

      // Act
      const response = await request(app).get('/projects');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /projects/:id', () => {
    it('should fetch a project by ID', async () => {
      // Arrange
      const project = await createTestProject();

      // Act
      const response = await request(app).get(
        `/projects/${project.project_id}`
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.project_id).toBe(project.project_id);
    });

    it('should return 404 for a non-existent project ID', async () => {
      // Act
      const response = await request(app).get(
        '/projects/00000000-0000-0000-0000-000000000000'
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update a project', async () => {
      // Arrange
      const project = await createTestProject();

      // Act
      const response = await request(app)
        .patch(`/projects/${project.project_id}`)
        .send({ name: 'Updated Project Name' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Project Name');
    });

    it('should return 404 for a non-existent project', async () => {
      const response = await request(app)
        .patch('/projects/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated Project' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const project = await createTestProject();
      const response = await request(app)
        .patch(`/projects/${project.project_id}`)
        .send({ status: 'INVALID' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete a project', async () => {
      // Arrange
      const project = await createTestProject();

      // Act
      const response = await request(app).delete(
        `/projects/${project.project_id}`
      );

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(
        `/projects/${project.project_id}`
      );
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent project', async () => {
      const response = await request(app).delete(
        '/projects/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
