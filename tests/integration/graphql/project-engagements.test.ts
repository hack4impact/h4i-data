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
        engagement_id
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
          engagement_id
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
    expect(engagement).toHaveProperty('engagement_id');
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
          engagement_id
          project_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.engagement_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.projectEngagement.engagement_id).toBe(
      created.engagement_id
    );
  });

  it('should return null for a non-existent project engagement ID', async () => {
    // Act
    const query = `
      query {
        projectEngagement(id: "00000000-0000-0000-0000-000000000000") {
          engagement_id
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
    const query = `query { projectEngagements { engagement_id } }`;
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
          engagement_id
          status
        }
      }
    `;
    const variables = {
      id: created.engagement_id,
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

  it('should delete a project engagement via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestEngagement(projectId);

    // Act
    const mutation = `
      mutation DeleteProjectEngagement($id: ID!) {
        deleteProjectEngagement(id: $id) {
          engagement_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables: { id: created.engagement_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteProjectEngagement.engagement_id).toBe(
      created.engagement_id
    );

    // Verify it's gone
    const verifyQuery = `query { projectEngagement(id: "${created.engagement_id}") { engagement_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.projectEngagement).toBeNull();
  });
});
