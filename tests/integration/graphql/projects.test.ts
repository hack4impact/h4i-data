import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a project for tests
const createTestProject = async (name = 'Test Project') => {
  const mutation = `
    mutation CreateProject($input: CreateProjectInput!) {
      createProject(input: $input) {
        project_id
        name
        github_url
        financial
      }
    }
  `;
  const variables = {
    input: {
      name,
      github_url: 'https://github.com/test/project',
      financial: 'PRO_BONO',
    },
  };
  const response = await request(app)
    .post('/')
    .send({ query: mutation, variables });
  return response.body.data.createProject;
};

describe('GraphQL API - Projects', () => {
  it('should create a new project via mutation', async () => {
    // Act
    const project = await createTestProject('GraphQL Integration Test Project');

    // Assert
    expect(project).toHaveProperty('project_id');
    expect(project.name).toBe('GraphQL Integration Test Project');
  });

  it('should fetch a project by its ID via query', async () => {
    // Arrange
    const project = await createTestProject('Test Project for Query');

    // Act
    const query = `
      query Project($id: ID!) {
        project(id: $id) {
          project_id
          name
          github_url
          financial
        }
      }
    `;
    const variables = { id: project.project_id };
    const response = await request(app).post('/').send({ query, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.project.project_id).toBe(project.project_id);
    expect(response.body.data.project.name).toBe('Test Project for Query');
  });

  it('should fetch all projects via query', async () => {
    // Arrange
    await createTestProject('Project for List');

    // Act
    const query = `query { projects { project_id name } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.projects)).toBe(true);
    expect(response.body.data.projects.length).toBeGreaterThan(0);
  });

  it('should update a project via mutation', async () => {
    // Arrange
    const project = await createTestProject('Project for Update');

    // Act
    const mutation = `
      mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
          project_id
          name
        }
      }
    `;
    const variables = {
      id: project.project_id,
      input: { name: 'Updated Project Name' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateProject.name).toBe('Updated Project Name');
  });

  it('should delete a project via mutation', async () => {
    // Arrange
    const project = await createTestProject('Project for Delete');

    // Act
    const mutation = `
      mutation DeleteProject($id: ID!) {
        deleteProject(id: $id) {
          project_id
        }
      }
    `;
    const variables = { id: project.project_id };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteProject.project_id).toBe(
      project.project_id
    );
  });
});
