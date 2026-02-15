import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper to create a project for tests
const createTestProject = async (name = 'Test Project') => {
  const response = await request(app).post('/projects').send({
    name,
    github_url: 'https://github.com/test/project',
    financial: 'PRO_BONO',
  });
  return response.body;
};

describe('REST API - /projects', () => {
  it('should create a new project via POST', async () => {
    // Act
    const response = await request(app).post('/projects').send({
      name: 'REST Integration Test Project',
      github_url: 'https://github.com/test/project',
      financial: 'PRO_BONO',
    });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('project_id');
    expect(response.body.name).toBe('REST Integration Test Project');
  });

  it('should fetch all projects via GET', async () => {
    // Arrange
    await createTestProject('Project for List');

    // Act
    const response = await request(app).get('/projects');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should fetch a project by ID via GET', async () => {
    // Arrange
    const project = await createTestProject('Project for Fetch');

    // Act
    const response = await request(app).get(`/projects/${project.project_id}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.project_id).toBe(project.project_id);
    expect(response.body.name).toBe('Project for Fetch');
  });

  it('should return 404 for a non-existent project ID', async () => {
    // Act
    const response = await request(app).get(
      '/projects/00000000-0000-0000-0000-000000000000'
    );

    // Assert
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    // Act - missing required 'name' field
    const response = await request(app).post('/projects').send({
      github_url: 'https://github.com/test/project',
      financial: 'PRO_BONO',
    });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should update a project via PATCH', async () => {
    // Arrange
    const project = await createTestProject('Project for Update');

    // Act
    const response = await request(app)
      .patch(`/projects/${project.project_id}`)
      .send({ name: 'Updated Project Name' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Project Name');
  });

  it('should delete a project via DELETE', async () => {
    // Arrange
    const project = await createTestProject('Project for Delete');

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
});
