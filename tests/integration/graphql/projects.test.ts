import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';

const app = createGraphqlApp();

// Helper to create a project for tests
const createTestProject = async () => {
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
      name: `Test Project ${Date.now()}.${Math.random()}`,
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
        name: `Test Project ${Date.now()}.${Math.random()}`,
        github_url: 'https://github.com/test/project',
        financial: 'PRO_BONO',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createProject).toHaveProperty('project_id');
  });

  it('should fetch a project by its ID via query', async () => {
    // Arrange
    const project = await createTestProject();

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
  });

  it('should return null for a non-existent project ID', async () => {
    // Act
    const query = `
      query {
        project(id: "00000000-0000-0000-0000-000000000000") {
          project_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.project).toBeNull();
  });

  it('should fetch all projects via query', async () => {
    // Arrange
    await createTestProject();

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
    const project = await createTestProject();

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

  it('should return errors when updating a non-existent project', async () => {
    // Act
    const mutation = `
      mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
          project_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { name: 'Updated' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid project input', async () => {
    // Arrange
    const project = await createTestProject();

    // Act
    const mutation = `
      mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
          project_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: project.project_id, input: { financial: 'INVALID' } },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent project', async () => {
    // Act
    const mutation = `
      mutation DeleteProject($id: ID!) {
        deleteProject(id: $id) {
          project_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: '00000000-0000-0000-0000-000000000000' },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should delete a project via mutation', async () => {
    // Arrange
    const project = await createTestProject();

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

    // Verify deletion
    const verifyQuery = `query { project(id: "${project.project_id}") { project_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.project).toBeNull();
  });
});
