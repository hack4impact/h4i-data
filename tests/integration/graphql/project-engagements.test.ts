import request from 'supertest';
import { createGraphqlApp } from '../../../src/api/graphql/server';
import { createRestApp } from '../../../src/api/rest/server';

const app = createGraphqlApp();
const restApp = createRestApp();

const createTestProject = async () => {
  const res = await request(restApp)
    .post('/projects')
    .send({ name: `Project ${Date.now()}.${Math.random()}` });
  return res.body.project_id;
};

const createTestEngagement = async (projectId: string) => {
  const mutation = `
    mutation CreateProjectEngagement($input: CreateProjectEngagementInput!) {
      createProjectEngagement(input: $input) {
        project_engagement_id
        project_id
        status
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: { input: { project_id: projectId, status: 'ACTIVE' } },
    });
  return response.body.data.createProjectEngagement;
};

describe('GraphQL API - Project Engagements', () => {
  it('should create a new project engagement via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();

    // Act
    const mutation = `
      mutation CreateProjectEngagement($input: CreateProjectEngagementInput!) {
        createProjectEngagement(input: $input) {
          project_engagement_id
          project_id
          status
          domain
        }
      }
    `;
    const variables = {
      input: { project_id: projectId, status: 'ACTIVE', domain: 'FULL_STACK' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const engagement = response.body.data.createProjectEngagement;
    expect(engagement).toHaveProperty('project_engagement_id');
    expect(engagement.project_id).toBe(projectId);
    expect(engagement.status).toBe('ACTIVE');
    expect(engagement.domain).toBe('FULL_STACK');
  });

  it('should fetch a project engagement by ID via query', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestEngagement(projectId);

    // Act
    const query = `
      query ProjectEngagement($id: ID!) {
        projectEngagement(id: $id) {
          project_engagement_id
          project_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.project_engagement_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.projectEngagement.project_engagement_id).toBe(
      created.project_engagement_id
    );
  });

  it('should return null for a non-existent project engagement ID', async () => {
    // Act
    const query = `
      query {
        projectEngagement(id: "00000000-0000-0000-0000-000000000000") {
          project_engagement_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.projectEngagement).toBeNull();
  });

  it('should fetch all project engagements via query', async () => {
    // Arrange
    const projectId = await createTestProject();
    await createTestEngagement(projectId);

    // Act
    const query = `query { projectEngagements { project_engagement_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.projectEngagements)).toBe(true);
    expect(response.body.data.projectEngagements.length).toBeGreaterThan(0);
  });

  it('should update a project engagement via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestEngagement(projectId);

    // Act
    const mutation = `
      mutation UpdateProjectEngagement($id: ID!, $input: UpdateProjectEngagementInput!) {
        updateProjectEngagement(id: $id, input: $input) {
          project_engagement_id
          status
        }
      }
    `;
    const variables = {
      id: created.project_engagement_id,
      input: { status: 'COMPLETED' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateProjectEngagement.status).toBe('COMPLETED');
  });

  it('should return errors when updating a non-existent project engagement', async () => {
    // Act
    const mutation = `
      mutation UpdateProjectEngagement($id: ID!, $input: UpdateProjectEngagementInput!) {
        updateProjectEngagement(id: $id, input: $input) {
          project_engagement_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { status: 'ACTIVE' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid project engagement input', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestEngagement(projectId);

    // Act
    const mutation = `
      mutation UpdateProjectEngagement($id: ID!, $input: UpdateProjectEngagementInput!) {
        updateProjectEngagement(id: $id, input: $input) {
          project_engagement_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: created.project_engagement_id,
          input: { status: 'INVALID' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent project engagement', async () => {
    // Act
    const mutation = `
      mutation DeleteProjectEngagement($id: ID!) {
        deleteProjectEngagement(id: $id) {
          project_engagement_id
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

  it('should delete a project engagement via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestEngagement(projectId);

    // Act
    const mutation = `
      mutation DeleteProjectEngagement($id: ID!) {
        deleteProjectEngagement(id: $id) {
          project_engagement_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.project_engagement_id },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.deleteProjectEngagement.project_engagement_id
    ).toBe(created.project_engagement_id);

    // Verify it's gone
    const verifyQuery = `query { projectEngagement(id: "${created.project_engagement_id}") { project_engagement_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.projectEngagement).toBeNull();
  });
});
