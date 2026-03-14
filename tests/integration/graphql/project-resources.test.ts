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

const createTestResource = async (projectId: string, label: string) => {
  const mutation = `
    mutation CreateProjectResource($input: CreateProjectResourceInput!) {
      createProjectResource(input: $input) {
        project_resource_id
        project_id
        label
      }
    }
  `;
  const response = await request(app)
    .post('/')
    .send({
      query: mutation,
      variables: { input: { project_id: projectId, label } },
    });
  return response.body.data.createProjectResource;
};

describe('GraphQL API - Project Resources', () => {
  it('should create a new project resource via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();

    // Act
    const mutation = `
      mutation CreateProjectResource($input: CreateProjectResourceInput!) {
        createProjectResource(input: $input) {
          project_resource_id
          project_id
          label
          category
        }
      }
    `;
    const variables = {
      input: {
        project_id: projectId,
        label: 'Source Code',
        url: 'https://github.com/org/repo',
        category: 'CODE',
      },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    const resource = response.body.data.createProjectResource;
    expect(resource).toHaveProperty('project_resource_id');
    expect(resource.project_id).toBe(projectId);
    expect(resource.label).toBe('Source Code');
    expect(resource.category).toBe('CODE');
  });

  it('should fetch a project resource by ID via query', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestResource(projectId, 'Design Spec');

    // Act
    const query = `
      query ProjectResource($id: ID!) {
        projectResource(id: $id) {
          project_resource_id
          label
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({ query, variables: { id: created.project_resource_id } });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.projectResource.project_resource_id).toBe(
      created.project_resource_id
    );
  });

  it('should return null for a non-existent project resource ID', async () => {
    // Act
    const query = `
      query {
        projectResource(id: "00000000-0000-0000-0000-000000000000") {
          project_resource_id
        }
      }
    `;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.projectResource).toBeNull();
  });

  it('should fetch all project resources via query', async () => {
    // Arrange
    const projectId = await createTestProject();
    await createTestResource(projectId, 'Documentation');

    // Act
    const query = `query { projectResources { project_resource_id } }`;
    const response = await request(app).post('/').send({ query });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.projectResources)).toBe(true);
    expect(response.body.data.projectResources.length).toBeGreaterThan(0);
  });

  it('should update a project resource via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestResource(projectId, 'Original Label');

    // Act
    const mutation = `
      mutation UpdateProjectResource($id: ID!, $input: UpdateProjectResourceInput!) {
        updateProjectResource(id: $id, input: $input) {
          project_resource_id
          label
        }
      }
    `;
    const variables = {
      id: created.project_resource_id,
      input: { label: 'Updated Label' },
    };
    const response = await request(app)
      .post('/')
      .send({ query: mutation, variables });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateProjectResource.label).toBe(
      'Updated Label'
    );
  });

  it('should return errors when updating a non-existent project resource', async () => {
    // Act
    const mutation = `
      mutation UpdateProjectResource($id: ID!, $input: UpdateProjectResourceInput!) {
        updateProjectResource(id: $id, input: $input) {
          project_resource_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
          input: { label: 'Updated Label' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a validation error for an invalid project resource input', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestResource(projectId, 'Original Label');

    // Act
    const mutation = `
      mutation UpdateProjectResource($id: ID!, $input: UpdateProjectResourceInput!) {
        updateProjectResource(id: $id, input: $input) {
          project_resource_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: {
          id: created.project_resource_id,
          input: { url: 'not-a-url' },
        },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeDefined();
  });

  it('should return errors when deleting a non-existent project resource', async () => {
    // Act
    const mutation = `
      mutation DeleteProjectResource($id: ID!) {
        deleteProjectResource(id: $id) {
          project_resource_id
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

  it('should delete a project resource via mutation', async () => {
    // Arrange
    const projectId = await createTestProject();
    const created = await createTestResource(projectId, 'To Delete');

    // Act
    const mutation = `
      mutation DeleteProjectResource($id: ID!) {
        deleteProjectResource(id: $id) {
          project_resource_id
        }
      }
    `;
    const response = await request(app)
      .post('/')
      .send({
        query: mutation,
        variables: { id: created.project_resource_id },
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteProjectResource.project_resource_id).toBe(
      created.project_resource_id
    );

    // Verify it's gone
    const verifyQuery = `query { projectResource(id: "${created.project_resource_id}") { project_resource_id } }`;
    const verifyResponse = await request(app)
      .post('/')
      .send({ query: verifyQuery });
    expect(verifyResponse.body.data.projectResource).toBeNull();
  });
});
